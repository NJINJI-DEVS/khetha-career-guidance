# Backend fixes — khetha-career-guidance

Concrete changes to apply in VS Code before building anything else on top of this backend.

---

## 1. Fix the APS scale bug

**File:** `backend/Services/ApsCalculatorService.cs`

**Problem:** The band table is shifted one level too high compared to the real NSC
(National Senior Certificate) achievement scale — the one already used correctly in the
frontend. As written, a 75% scores as Level 5 instead of the correct Level 6; an 82%
scores as Level 6 instead of Level 7. Across six subjects this can understate a
learner's real APS by several points — potentially the difference between qualifying
for a programme and being told they don't.

**Find:**

```csharp
    // % range -> points, standard 7-point scale (most SA public universities)
    private static readonly (int min, int max, int points)[] StandardScale =
    {
        (90, 100, 7),
        (80, 89, 6),
        (70, 79, 5),
        (60, 69, 4),
        (50, 59, 3),
        (40, 49, 2),
        (30, 39, 1),
        (0, 29, 0),
    };
```

**Replace with:**

```csharp
    // % range -> points, NSC (National Senior Certificate) 7-point achievement scale
    private static readonly (int min, int max, int points)[] StandardScale =
    {
        (80, 100, 7),
        (70, 79, 6),
        (60, 69, 5),
        (50, 59, 4),
        (40, 49, 3),
        (30, 39, 2),
        (0, 29, 1),
    };
```

No other code change is needed — `PointsFor()` just walks this table, so fixing the
table fixes the score everywhere it's used (`ApsController` and `CourseMatchingService`
both go through this same method).

**Sanity check after the change:**
- 82% → should return 7 (was 6)
- 45% → should return 3 (was 2)

---

## 2. Stop tracking build artifacts

`bin/` and `obj/` are currently committed — 141 files, ~32MB.

From the repo root, in the terminal:

```bash
git rm -r --cached backend/bin backend/obj
```

This untracks them without deleting them from disk.

Then create a `.gitignore` at the **repo root** (not inside `backend/`)
containing at least:

```
bin/
obj/
*.user
appsettings.Development.json
appsettings.*.local.json
.vs/
```

---

## 3. Remove the stray empty folder

Delete `backend/khetha-career-guidance/` in the VS Code file explorer — it's
empty and unused.

---

## 4. Commit

```bash
git add .
git commit -m "Fix APS scale to match NSC achievement bands; add .gitignore; remove build artifacts from tracking"
git push
```

---

## Next up

Once this is pushed: draft EF Core models + migration for the mentor hub — help
requests, messages (with server-side redaction), and the audit log — on top of the
existing `AppDbContext` structure.
