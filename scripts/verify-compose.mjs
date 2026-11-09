import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const repositoryRoot = resolve(import.meta.dirname, "..");
const dockerCommand = process.platform === "win32" ? "docker.exe" : "docker";

function invariant(condition, message) {
  if (!condition) throw new Error(`Compose verification failed: ${message}`);
}

let rendered;
try {
  rendered = execFileSync(
    dockerCommand,
    ["compose", "--file", "compose.yaml", "config", "--format", "json"],
    { cwd: repositoryRoot, encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] },
  );
} catch (error) {
  const status = typeof error?.status === "number" ? ` (exit ${error.status})` : "";
  throw new Error(`Docker Compose could not render compose.yaml${status}.`, { cause: error });
}

const configuration = JSON.parse(rendered);
const services = configuration.services ?? {};
const requiredServices = ["postgres", "backend-migrate", "backend", "cms", "frontend"];

for (const serviceName of requiredServices) {
  invariant(services[serviceName], `missing service '${serviceName}'`);
}

for (const serviceName of ["postgres", "backend", "cms", "frontend"]) {
  invariant(services[serviceName].healthcheck?.test, `${serviceName} must define a healthcheck`);
}

invariant(
  services["backend-migrate"].depends_on?.postgres?.condition === "service_healthy",
  "backend-migrate must wait for healthy PostgreSQL",
);
invariant(
  services.backend.depends_on?.["backend-migrate"]?.condition === "service_completed_successfully",
  "backend must wait for successful Prisma migration",
);
invariant(
  services.frontend.depends_on?.backend?.condition === "service_healthy" &&
    services.frontend.depends_on?.cms?.condition === "service_healthy",
  "frontend must wait for healthy Backend and CMS",
);

for (const serviceName of ["postgres", "backend", "cms", "frontend"]) {
  const publishedPorts = services[serviceName].ports ?? [];
  invariant(publishedPorts.length > 0, `${serviceName} must publish a local port`);
  invariant(
    publishedPorts.every((port) => port.host_ip === "127.0.0.1"),
    `${serviceName} ports must bind only to 127.0.0.1`,
  );
}

for (const volumeName of ["postgres-data", "backend-media", "strapi-uploads"]) {
  invariant(configuration.volumes?.[volumeName], `missing named volume '${volumeName}'`);
}

invariant(services["backend-migrate"].build?.target === "builder", "migration must use Backend builder target");
invariant(services.backend.build?.target === "runner", "Backend must use runner target");
invariant(services.cms.build?.target === "runner", "CMS must use runner target");
invariant(services.frontend.build?.target === "runner", "Frontend must use runner target");

const composeSource = readFileSync(resolve(repositoryRoot, "compose.yaml"), "utf8");
for (const forbidden of ["Toranj@Admin2026", "PRIVATE KEY", "postgres://postgres:postgres@"]) {
  invariant(!composeSource.includes(forbidden), `compose.yaml contains forbidden credential material: ${forbidden}`);
}

console.log("Compose configuration verified: services, ordering, healthchecks, loopback ports, build targets, and volumes are valid.");
