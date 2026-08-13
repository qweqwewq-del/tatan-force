# Risks

| ID | Risk | Probability | Impact | Control | Owner | Status | Blocks release |
|---|---|---|---|---|---|---|---|
| OPS-001 | Railway local upload files can be lost if the running container is replaced. | Medium | Medium | Add a Railway Volume or R2 / OSS / COS before ongoing image administration. | Site owner | Open follow-up | No |
| TOOL-001 | Development-only tooling audit reports transitive advisories. | Low | Low | Reassess when updating the frontend toolchain. Production image omits dev dependencies. | Development | Open follow-up | No |

## Active Blockers

None.
