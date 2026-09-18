using CareerAdvisor.Api.Data;
using CareerAdvisor.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// ---- Database: Supabase Postgres via Npgsql -------------------------------
// Connection string comes from appsettings / env var, e.g.:
// "Host=db.<project-ref>.supabase.co;Port=5432;Database=postgres;Username=postgres;Password=***;SSL Mode=Require;Trust Server Certificate=true"
// This can't itself live in Supabase Vault — you need a working DB connection to
// read Vault in the first place — so it stays in normal config/env as before.
var connectionString = builder.Configuration.GetConnectionString("Supabase")
    ?? throw new InvalidOperationException("ConnectionStrings:Supabase is not configured");

builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseNpgsql(connectionString)
       .UseSnakeCaseNamingConvention());

// ---- Auth: validate Supabase-issued JWTs -----------------------------------
// Supabase Auth issues JWTs signed with the project's JWT Signing Key. This
// project uses the newer asymmetric (ES256) key rather than a legacy shared
// HS256 secret, so there is no static secret to hold anywhere — validation
// uses the project's public JWKS instead, which the JwtBearer handler fetches
// (and refreshes) itself from Supabase's standard OIDC discovery document.
var supabaseUrl = builder.Configuration["Supabase:Url"] ?? "";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        // Without this, the JwtBearerHandler remaps well-known claim names (e.g. "sub"
        // -> the WS-* nameidentifier URI) before they reach User.FindFirst(), which
        // silently breaks every controller that reads Supabase's "sub" claim by name
        // (see MatriculantsController.CurrentUserId).
        options.MapInboundClaims = false;
        options.Authority = $"{supabaseUrl}/auth/v1";
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            ValidateIssuer = true,
            ValidIssuer = $"{supabaseUrl}/auth/v1",
            ValidateAudience = true,
            ValidAudience = "authenticated",
            ValidateLifetime = true,
        };
    });
// AdminAuthorizationHandler is Scoped (not the framework's typical Singleton
// registration for handlers) because it injects AppDbContext.
builder.Services.AddScoped<IAuthorizationHandler, AdminAuthorizationHandler>();
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.Requirements.Add(new AdminRequirement()));
});

// ---- App services -----------------------------------------------------------
builder.Services.AddScoped<IApsCalculatorService, ApsCalculatorService>();
builder.Services.AddScoped<ICourseMatchingService, CourseMatchingService>();
builder.Services.AddScoped<IOfoImportService, OfoImportService>();
builder.Services.AddScoped<ISaqaImportService, SaqaImportService>();
builder.Services.AddHttpClient<IGovernmentPortalScraperService, GovernmentPortalScraperService>();
builder.Services.AddHttpClient<IAdvisorService, AdvisorService>();
builder.Services.AddScoped<ISaIdService, SaIdService>();
builder.Services.AddScoped<IRiskFlagsService, RiskFlagsService>();
builder.Services.AddScoped<IRedactionService, RedactionService>();
builder.Services.AddScoped<ISmsSummaryService, SmsSummaryService>();

// ---- CORS for the React PWA -------------------------------------------------
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
    ?? new[] { "http://localhost:5173" };

builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
        policy.WithOrigins(allowedOrigins).AllowAnyHeader().AllowAnyMethod());
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Skipped in Development: the frontend's dev server talks to the API over plain
// http on localhost (see frontend/.env.example's VITE_API_BASE_URL), and a redirect
// to https here would hit the ASP.NET Core dev cert, which browsers reject unless
// `dotnet dev-certs https --trust` has been run — breaking every fetch() call with
// a TLS error rather than a clear one.
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}
app.UseCors("FrontendPolicy");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
