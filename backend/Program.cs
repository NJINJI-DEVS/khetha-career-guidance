using CareerAdvisor.Api.Data;
using CareerAdvisor.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// ---- Database: Supabase Postgres via Npgsql -------------------------------
// Connection string comes from appsettings / env var, e.g.:
// "Host=db.<project-ref>.supabase.co;Port=5432;Database=postgres;Username=postgres;Password=***;SSL Mode=Require;Trust Server Certificate=true"
builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseNpgsql(builder.Configuration.GetConnectionString("Supabase")));

// ---- Auth: validate Supabase-issued JWTs -----------------------------------
// Supabase Auth issues standard JWTs signed with your project's JWT secret.
// The React frontend authenticates via supabase-js and sends the access_token
// as a Bearer header; this API just validates it rather than issuing its own.
var supabaseJwtSecret = builder.Configuration["Supabase:JwtSecret"]
    ?? throw new InvalidOperationException("Supabase:JwtSecret is not configured");
var supabaseUrl = builder.Configuration["Supabase:Url"] ?? "";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(supabaseJwtSecret)),
            ValidateIssuer = true,
            ValidIssuer = $"{supabaseUrl}/auth/v1",
            ValidateAudience = true,
            ValidAudience = "authenticated",
            ValidateLifetime = true,
        };
    });
builder.Services.AddAuthorization();

// ---- App services -----------------------------------------------------------
builder.Services.AddScoped<IApsCalculatorService, ApsCalculatorService>();
builder.Services.AddScoped<ICourseMatchingService, CourseMatchingService>();
builder.Services.AddScoped<IOfoImportService, OfoImportService>();
builder.Services.AddScoped<ISaqaImportService, SaqaImportService>();
builder.Services.AddHttpClient<IGovernmentPortalScraperService, GovernmentPortalScraperService>();

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

app.UseHttpsRedirection();
app.UseCors("FrontendPolicy");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
