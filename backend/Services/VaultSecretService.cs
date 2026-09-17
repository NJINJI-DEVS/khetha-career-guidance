using Npgsql;

namespace CareerAdvisor.Api.Services;

/// <summary>
/// Reads secrets out of Supabase Vault (the `vault.decrypted_secrets` view Supabase
/// provisions once the `supabase_vault` extension is enabled) instead of plaintext
/// config. Only usable for secrets OTHER than the Postgres connection string itself —
/// you need a working DB connection to read Vault in the first place, so the
/// connection string still has to come from normal config/env.
///
/// One-time setup in the Supabase SQL editor (values, not the query, are the secret —
/// never paste a real secret value into a chat/log):
///   create extension if not exists supabase_vault;
///   select vault.create_secret('&lt;real-jwt-secret&gt;', 'supabase_jwt_secret',
///     'JWT secret for validating Supabase Auth tokens in the ASP.NET Core backend');
/// </summary>
public interface IVaultSecretService
{
    Task<string> GetRequiredSecretAsync(string name, CancellationToken ct = default);
}

public class VaultSecretService : IVaultSecretService
{
    private readonly string _connectionString;

    public VaultSecretService(string connectionString) => _connectionString = connectionString;

    public async Task<string> GetRequiredSecretAsync(string name, CancellationToken ct = default)
    {
        await using var conn = new NpgsqlConnection(_connectionString);
        await conn.OpenAsync(ct);

        await using var cmd = new NpgsqlCommand(
            "select decrypted_secret from vault.decrypted_secrets where name = $1 limit 1", conn);
        cmd.Parameters.AddWithValue(name);

        await using var reader = await cmd.ExecuteReaderAsync(ct);
        if (!await reader.ReadAsync(ct) || await reader.IsDBNullAsync(0, ct))
        {
            throw new InvalidOperationException(
                $"Supabase Vault secret '{name}' was not found. Run vault.create_secret(...) " +
                "for it in the Supabase SQL editor — see VaultSecretService's doc comment.");
        }

        return reader.GetString(0);
    }
}
