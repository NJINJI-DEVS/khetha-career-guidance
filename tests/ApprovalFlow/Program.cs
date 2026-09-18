using System.Net;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Text;
using System.Text.Encodings.Web;
using System.Text.Json;
using CareerAdvisor.Api.Controllers;
using CareerAdvisor.Api.Data;
using CareerAdvisor.Api.Models;
using CareerAdvisor.Api.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Npgsql;

// Run from repository root. Uses real PostgreSQL in a temporary, isolated schema.
// Fake identities exist only in this loopback test host, never in Supabase Auth.
var repository = new DirectoryInfo(AppContext.BaseDirectory);
while (repository is not null && !File.Exists(Path.Combine(repository.FullName, "backend", "CareerAdvisor.Api.csproj"))) repository = repository.Parent;
if (repository is null) throw new Exception("Cannot locate repository root.");
var config = new ConfigurationBuilder().AddJsonFile(Path.Combine(repository.FullName, "backend/appsettings.Development.json"), optional: true).AddEnvironmentVariables().Build();
var original = config["ApprovalTestConnection"] ?? config.GetConnectionString("Supabase")
    ?? throw new Exception("Set ApprovalTestConnection or configure backend/appsettings.Development.json.");
var schema = "approval_test_" + Guid.NewGuid().ToString("N");
var connectionString = new NpgsqlConnectionStringBuilder(original) { SearchPath = schema, Pooling = false }.ConnectionString;
var documentRoot = Path.Combine(repository.FullName, "artifacts", schema);
await using var management = new NpgsqlConnection(original);
await management.OpenAsync();
await using (var create = new NpgsqlCommand($"CREATE SCHEMA {schema}", management)) await create.ExecuteNonQueryAsync();
WebApplication? app = null;
try
{
    var builder = WebApplication.CreateBuilder();
    builder.Logging.ClearProviders();
    builder.WebHost.UseUrls("http://127.0.0.1:0");
    builder.Configuration["Documents:Path"] = documentRoot;
    builder.Services.AddDbContext<AppDbContext>(options => options.UseNpgsql(connectionString).UseSnakeCaseNamingConvention());
    builder.Services.AddControllers().AddApplicationPart(typeof(MentorApplicationsController).Assembly);
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen();
    builder.Services.AddAuthentication("TestIdentity").AddScheme<AuthenticationSchemeOptions, TestIdentity>("TestIdentity", _ => { });
    builder.Services.AddScoped<IAuthorizationHandler, AdminAuthorizationHandler>();
    builder.Services.AddAuthorization(options => options.AddPolicy("AdminOnly", policy => policy.Requirements.Add(new AdminRequirement())));
    builder.Services.AddScoped<ISaIdService, SaIdService>();
    builder.Services.AddScoped<IRiskFlagsService, RiskFlagsService>();
    builder.Services.AddScoped<IApsCalculatorService, ApsCalculatorService>();
    builder.Services.AddSingleton<ApplicationDocuments>();
    app = builder.Build();
    app.UseSwagger(); app.UseAuthentication(); app.UseAuthorization(); app.MapControllers();
    var student = Guid.NewGuid(); var mentor = Guid.NewGuid(); var rejected = Guid.NewGuid(); var admin = Guid.NewGuid(); var fresh = Guid.NewGuid();
    var legacyAdmin = Guid.NewGuid(); var inactiveAdmin = Guid.NewGuid();
    await using (var scope = app.Services.CreateAsyncScope())
    {
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await db.Database.ExecuteSqlRawAsync(db.Database.GenerateCreateScript());
        db.UserRoles.AddRange(new UserRole { UserId = student, Role = "student" }, new UserRole { UserId = mentor, Role = "mentor" },
            new UserRole { UserId = rejected, Role = "professional" }, new UserRole { UserId = legacyAdmin, Role = "admin" });
        db.Admins.AddRange(new Admin { UserId = admin, Email = "admin@example.test" },
            new Admin { UserId = inactiveAdmin, Email = "inactive@example.test", IsActive = false });
        await db.SaveChangesAsync();
    }
    await app.StartAsync();
    using var client = new HttpClient { BaseAddress = new Uri(app.Urls.Single()) };
    var passed = 0;
    async Task<HttpResponseMessage> Send(Guid? user, HttpMethod method, string path, HttpContent? content = null)
    {
        var request = new HttpRequestMessage(method, path) { Content = content };
        if (user.HasValue) request.Headers.Add("X-Test-User", user.ToString());
        return await client.SendAsync(request);
    }
    async Task Check(HttpResponseMessage response, HttpStatusCode expected, string label)
    {
        if (response.StatusCode != expected) throw new Exception($"FAIL {label}: expected {expected}, got {response.StatusCode}: {await response.Content.ReadAsStringAsync()}");
        Console.WriteLine($"PASS {++passed}: {label}");
    }
    MultipartFormDataContent Application(bool validFile = true, bool missingFields = false)
    {
        var content = new MultipartFormDataContent();
        content.Add(JsonContent.Create(new {
            role = "admin", userId = admin, status = "approved", riskScore = 0, partnerName = "Forged partner", // These must not be trusted.
            fullName = "Test Mentor", idNumber = "AB123456", institution = "Test University", field = "stem",
            subjects = new[] { "Mathematics" }, claim = missingFields ? "" : "I tutor mathematics.", workEmail = "mentor@test.ac.za", licenceBody = "none", submitSeconds = 120
        }), "application");
        content.Add(new ByteArrayContent(Encoding.ASCII.GetBytes(validFile ? "%PDF-1.4\nTest fixture document\n%%EOF" : "not a document")), "idDocument", "test-id.pdf");
        return content;
    }
    var basePath = "/api/mentorapplications";
    await Check(await Send(null, HttpMethod.Get, "/swagger/v1/swagger.json"), HttpStatusCode.OK, "API documentation supports multipart uploads");
    await Check(await Send(null, HttpMethod.Get, basePath), HttpStatusCode.Unauthorized, "anonymous cannot list applications");
    await Check(await Send(null, HttpMethod.Get, "/api/admin/me"), HttpStatusCode.Unauthorized, "admin login requires authentication");
    await Check(await Send(admin, HttpMethod.Get, "/api/admin/me"), HttpStatusCode.OK, "admin login checks dedicated admins table without a user_roles entry");
    var adminRole = await (await Send(admin, HttpMethod.Get, "/api/account/role")).Content.ReadFromJsonAsync<AccountRoleDto>();
    if (adminRole?.Role != "admin") throw new Exception("Dedicated admin could not resolve its navigation role.");
    Console.WriteLine($"PASS {++passed}: role resolution uses admins table");
    foreach (var denied in new[] { student, mentor, legacyAdmin, inactiveAdmin }) {
        await Check(await Send(denied, HttpMethod.Get, "/api/admin/me"), HttpStatusCode.Forbidden, "non-member, legacy role or inactive admin cannot log in as admin");
        await Check(await Send(denied, HttpMethod.Get, basePath), HttpStatusCode.Forbidden, "admin access requires active admins row");
    }
    await Check(await Send(inactiveAdmin, HttpMethod.Get, "/api/account/role"), HttpStatusCode.Forbidden, "inactive admin cannot regain access through public login");
    await Check(await Send(legacyAdmin, HttpMethod.Get, "/api/account/role"), HttpStatusCode.Forbidden, "legacy role alone cannot resolve to admin");
    await Check(await Send(admin, HttpMethod.Post, "/api/account/role", JsonContent.Create(new { role = "student" })), HttpStatusCode.Conflict, "admin cannot overwrite dedicated membership through role claim");
    foreach (var user in new[] { student, mentor, legacyAdmin, inactiveAdmin }) {
        await Check(await Send(user, HttpMethod.Get, basePath), HttpStatusCode.Forbidden, "non-admin cannot list all applications");
        await Check(await Send(user, HttpMethod.Get, basePath + "/pending"), HttpStatusCode.Forbidden, "non-admin cannot list pending applications");
        await Check(await Send(user, HttpMethod.Post, basePath + $"/{Guid.NewGuid()}/approve"), HttpStatusCode.Forbidden, "non-admin cannot approve");
        await Check(await Send(user, HttpMethod.Post, basePath + $"/{Guid.NewGuid()}/reject"), HttpStatusCode.Forbidden, "non-admin cannot reject");
        await Check(await Send(user, HttpMethod.Get, basePath + $"/{Guid.NewGuid()}/documents/identity"), HttpStatusCode.Forbidden, "non-admin cannot download ID documents");
        await Check(await Send(user, HttpMethod.Get, "/api/admin/analytics"), HttpStatusCode.Forbidden, "non-admin cannot access analytics");
    }
    await Check(await Send(fresh, HttpMethod.Post, "/api/account/role", JsonContent.Create(new { role = "admin" })), HttpStatusCode.BadRequest, "admin cannot be self-registered");
    await Check(await Send(student, HttpMethod.Post, basePath, Application()), HttpStatusCode.Forbidden, "student cannot submit a mentor application");
    await Check(await Send(mentor, HttpMethod.Post, basePath, Application(false)), HttpStatusCode.BadRequest, "fake upload is rejected");
    await Check(await Send(mentor, HttpMethod.Post, basePath, Application(missingFields: true)), HttpStatusCode.BadRequest, "incomplete application is rejected");
    var submit = await Send(mentor, HttpMethod.Post, basePath, Application());
    await Check(submit, HttpStatusCode.Created, "mentor submits real application");
    var application = (await submit.Content.ReadFromJsonAsync<MentorApplication>())!;
    if (application.Status != "pending" || application.Role != "mentor" || application.UserId != mentor || application.PartnerName is not null)
        throw new Exception("Client-supplied identity, role, partner or status was trusted.");
    Console.WriteLine($"PASS {++passed}: server owns identity, role and approval status");
    await Check(await Send(mentor, HttpMethod.Post, basePath, Application()), HttpStatusCode.Conflict, "duplicate submission is rejected");
    var before = await (await Send(student, HttpMethod.Get, "/api/mentors")).Content.ReadFromJsonAsync<List<Mentor>>();
    if (before!.Count != 0) throw new Exception("Pending mentor is visible to learners.");
    Console.WriteLine($"PASS {++passed}: pending mentor is hidden from directory");
    await Check(await Send(admin, HttpMethod.Get, basePath + $"/{application.Id}/documents/identity"), HttpStatusCode.OK, "admin downloads real evidence");
    var decisions = await Task.WhenAll(Send(admin, HttpMethod.Post, basePath + $"/{application.Id}/approve"), Send(admin, HttpMethod.Post, basePath + $"/{application.Id}/approve"));
    if (decisions.Count(r => r.StatusCode == HttpStatusCode.OK) != 1 || decisions.Count(r => r.StatusCode == HttpStatusCode.Conflict) != 1)
        throw new Exception("Concurrent approval did not return one success and one conflict: " + string.Join(",", decisions.Select(r => r.StatusCode)));
    Console.WriteLine($"PASS {++passed}: concurrent approval creates only one decision");
    var after = await (await Send(student, HttpMethod.Get, "/api/mentors")).Content.ReadFromJsonAsync<List<Mentor>>();
    if (after!.Count != 1 || after[0].UserId != mentor || after[0].Subjects.Single() != "Mathematics") throw new Exception("Approved directory entry is wrong.");
    Console.WriteLine($"PASS {++passed}: approved mentor is visible with submitted details");
    var restored = await (await Send(mentor, HttpMethod.Get, basePath + "/me")).Content.ReadFromJsonAsync<List<MentorApplication>>();
    if (restored!.Single().Status != "approved") throw new Exception("Approval was not persisted.");
    Console.WriteLine($"PASS {++passed}: mentor reload sees persisted approval");
    await Check(await Send(admin, HttpMethod.Post, basePath + $"/{application.Id}/reject"), HttpStatusCode.Conflict, "cannot reverse a decided application");
    var second = await Send(rejected, HttpMethod.Post, basePath, Application());
    await Check(second, HttpStatusCode.Created, "professional submits application");
    var secondId = (await second.Content.ReadFromJsonAsync<MentorApplication>())!.Id;
    await Check(await Send(admin, HttpMethod.Post, basePath + $"/{secondId}/reject"), HttpStatusCode.NoContent, "administrator rejects application");
    await Check(await Send(rejected, HttpMethod.Post, basePath, Application()), HttpStatusCode.Created, "rejected applicant can reapply");
    var history = await (await Send(admin, HttpMethod.Get, basePath)).Content.ReadFromJsonAsync<List<MentorApplication>>();
    if (history!.Select(a => a.Status).Distinct().Count() != 3) throw new Exception("Admin queue does not retain all statuses.");
    Console.WriteLine($"PASS {++passed}: dashboard includes pending, approved and rejected history");
    await using (var scope = app.Services.CreateAsyncScope()) {
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        if (await db.AuditLogs.CountAsync() != 2 || await db.Notifications.CountAsync() != 2) throw new Exception("Decision audit/notifications are missing or duplicated.");
    }
    Console.WriteLine($"PASS {++passed}: decisions produce exactly one audit and notification each");
    await using (var scope = app.Services.CreateAsyncScope()) {
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await db.Admins.Where(a => a.UserId == admin).ExecuteUpdateAsync(setters => setters.SetProperty(a => a.IsActive, false));
    }
    await Check(await Send(admin, HttpMethod.Get, basePath), HttpStatusCode.Forbidden, "disabling admin revokes access on the next request with the same identity");
    Console.WriteLine($"All {passed} approval flow checks passed.");
}
finally
{
    if (app is not null) { await app.StopAsync(); await app.DisposeAsync(); }
    // schema is generated above, never supplied by the caller. No public/auth data is touched.
    await using var drop = new NpgsqlCommand($"DROP SCHEMA {schema} CASCADE", management);
    await drop.ExecuteNonQueryAsync();
    if (Directory.Exists(documentRoot)) {
        foreach (var directory in Directory.GetDirectories(documentRoot)) {
            foreach (var file in Directory.GetFiles(directory)) File.Delete(file);
            Directory.Delete(directory);
        }
        Directory.Delete(documentRoot);
    }
    Console.WriteLine("Removed the isolated test schema and fixture documents.");
}

sealed class TestIdentity(IOptionsMonitor<AuthenticationSchemeOptions> options, ILoggerFactory logger, UrlEncoder encoder)
    : AuthenticationHandler<AuthenticationSchemeOptions>(options, logger, encoder)
{
    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        if (!Guid.TryParse(Request.Headers["X-Test-User"], out var userId)) return Task.FromResult(AuthenticateResult.NoResult());
        var claims = new[] { new Claim("sub", userId.ToString()), new Claim("account_role", "admin") }; // Forged metadata must not grant access.
        var user = new ClaimsPrincipal(new ClaimsIdentity(claims, Scheme.Name));
        return Task.FromResult(AuthenticateResult.Success(new AuthenticationTicket(user, Scheme.Name)));
    }
}
