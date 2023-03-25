import {PoolConfig} from "pg";

export type PostgresConfig = { type: "postgres", config: PoolConfig };
export type DockerPostgresConfig = { type: "docker-postgres", config: PoolConfig };
export type DataStoreConfig = PostgresConfig | DockerPostgresConfig;
export type SecureAuthConfig = { type: "secure", publicKey: string, privateKey: string };
export type InsecureAuthConfig = { type: "insecure", expectedSignature: string };
export type AuthConfig = SecureAuthConfig | InsecureAuthConfig;

export type DocStoreConfig = {
    auth: AuthConfig,
    containsPii: boolean,
    dataStore: DataStoreConfig
};