# Dependency security repair — November 1, 2026

Upgraded Zod to 4.6.7, including OpenAI’s dependency resolution, to fix GHSA-mrhx-c7xc-m3w5. No application schema imports required migration. Regressions verify oversized arrays/maps/sets reject before element parsing, normal input still parses, and OpenAI structured-output helpers accept the schema.

Modern minimatch is pinned to 11.0.1. Bounded subprocess tests exercise the amplification regression and ordinary matching. Where the legacy callable 3.1.5 remains required, its exact reviewed source hash is checked; it predates the vulnerable firstPhasePreProcess algorithm. No alerts were dismissed and no audit thresholds were weakened.
