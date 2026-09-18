using System.Net.Http.Headers;
using System.Net.Mail;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using CareerAdvisor.Api.Data;
using Npgsql;

namespace CareerAdvisor.Api.Services;

// Operator-only command. Never expose this as a public registration endpoint.
public static class AdminProvisioning
{
    public static async Task Run(IServiceProvider services, IConfiguration config, string email)
    {
        if (!MailAddress.TryCreate(email, out var address) || address.Address != email)
            throw new InvalidOperationException("Provide a valid administrator email address.");
        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await using var connection = new NpgsqlConnection(db.Database.GetConnectionString());
        await connection.OpenAsync();
        await using var lookup = new NpgsqlCommand("SELECT id FROM auth.users WHERE lower(email) = lower(@email) AND deleted_at IS NULL", connection);
        lookup.Parameters.AddWithValue("email", email);
        var existingId = await lookup.ExecuteScalarAsync();
        Guid userId;
        if (existingId is Guid found) userId = found;
        else
        {
            var key = config["Supabase:SecretKey"];
            var password = config["AdminBootstrap:Password"];
            if (string.IsNullOrWhiteSpace(key) || string.IsNullOrWhiteSpace(password))
                throw new InvalidOperationException("For a new account, set Supabase__SecretKey and AdminBootstrap__Password in the server environment. Existing Auth accounts need neither.");
            if (password.Length < 12) throw new InvalidOperationException("Use an administrator password of at least 12 characters.");
            using var http = new HttpClient();
            http.DefaultRequestHeaders.Add("apikey", key);
            // Legacy service-role JWTs also need bearer authentication; newer
            // secret keys are resolved by Supabase's gateway from apikey.
            if (!key.StartsWith("sb_secret_")) http.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", key);
            var response = await http.PostAsJsonAsync($"{config["Supabase:Url"]?.TrimEnd('/')}/auth/v1/admin/users",
                new { email, password, email_confirm = true });
            if (!response.IsSuccessStatusCode)
                throw new InvalidOperationException($"Supabase could not create the administrator (HTTP {(int)response.StatusCode}). Check the server secret key and password policy.");
            using var body = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
            userId = body.RootElement.GetProperty("id").GetGuid();
        }
        // Retry-safe if Auth creation succeeded but the database write failed.
        await using var transaction = await db.Database.BeginTransactionAsync();
        var normalizedEmail = email.Trim().ToLowerInvariant();
        await db.Database.ExecuteSqlInterpolatedAsync($"INSERT INTO admins (user_id, email, is_active, created_at) VALUES ({userId}, {normalizedEmail}, true, {DateTime.UtcNow}) ON CONFLICT (user_id) DO UPDATE SET email = EXCLUDED.email, is_active = true");
        await db.Database.ExecuteSqlInterpolatedAsync($"DELETE FROM user_roles WHERE user_id = {userId} AND role = 'admin'");
        await transaction.CommitAsync();
        Console.WriteLine("Administrator account provisioned. Sign in using the administrator login icon.");
    }
}
