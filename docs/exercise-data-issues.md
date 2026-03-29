# Exercise Data Issues

Findings from a comprehensive audit of all 1,318 exercises in `data/exercises.json` (post-dedup, post-type-correction). These are upstream ExerciseDB data quality issues inherited when we adopted the dataset. Tracked here for incremental cleanup.

## Summary

| Category | Est. Count | Impact |
|----------|-----------|--------|
| Wrong target muscles | ~70-100 | Affects muscle-group filtering accuracy |
| Wrong instructions | ~80-120 | Misleading exercise guidance |
| Equipment mismatches | ~30-45 | Missing required equipment from listing |
| Name typos / encoding | ~15-20 | Display quality |

## 1. Wrong Target Muscles

ExerciseDB systematically misclassifies primary targets in two patterns:

**Quad-dominant squats listed as glutes:**
- barbell front squat, barbell clean-grip front squat, barbell front chest squat
- barbell hack squat
- barbell narrow stance squat
- sled 45° leg press (all variants), sled hack squat, sled closer hack squat
- sled 45 degrees one leg press
- kettlebell pistol squat

**Chest pressing movements listed as triceps:**
- dumbbell neutral grip bench press
- dumbbell palms in incline bench press
- dumbbell decline one arm hammer press
- dumbbell incline hammer press on exercise ball
- dumbbell incline one arm hammer press
- dumbbell incline one arm hammer press on exercise ball
- barbell one arm floor press
- barbell pin presses
- medicine ball supine chest throw

**Other misclassifications:**
- flutter kicks: listed as glutes, should be abs
- handstand / handstand push-up: listed as triceps, should be delts
- pike-to-cobra push-up, outside leg kick push-up, push-up inside leg kick: listed as glutes, should be pectorals
- medicine ball overhead slam: listed as upper back, should be abs
- kettlebell hang clean / alternating hang clean / double alternating hang clean: listed as forearms/biceps, should be glutes
- kettlebell two arm clean: listed as delts, should be glutes
- barbell clean and press: listed as quads, should be delts
- barbell rack pull: listed as glutes, should be upper back/traps
- barbell squat (on knees): listed as quads, should be glutes
- isometric wipers: listed as pectorals, should be abs/obliques
- smith hip raise: listed as abs, should be glutes
- potty squat: listed as abs, should be glutes
- lean planche / straddle maltese / straddle planche: listed as abs, should be delts
- front lever: listed as abs, should be lats
- flag: listed as abs, should be lats/obliques
- gorilla chin: listed as abs, should be lats
- modified push up to lower arms: listed as forearms, should be triceps/pectorals
- dumbbell over bench neutral wrist curl / one arm variant: listed as biceps, should be forearms
- dumbbell seated neutral wrist curl: listed as biceps, should be forearms
- ez barbell reverse grip curl: listed as biceps, should be forearms
- band single leg reverse calf raise: listed as calves, should be tibialis anterior
- basic toe touch: listed as glutes, should be hamstrings
- bent knee lying twist: listed as glutes, should be abs/obliques
- back pec stretch: listed as lats, should be pectorals
- assisted prone rectus femoris stretch: listed as abs, should be quads
- ski ergometer: listed as triceps, should be lats/cardiovascular
- cable standing pulldown (with rope): listed as biceps, should be lats
- circles knee stretch: listed as calves, should be quads/hip flexors
- seated lower back stretch: listed as lats, should be spine/erector spinae
- exercise ball hip flexor stretch (+ pointed variant): listed as glutes, should be hip flexors
- exercise ball lower back stretch (pyramid): listed as lats, should be spine
- exercise ball pike push up: listed as pectorals, should be delts
- two toe touch: listed as spine, should be hamstrings
- dumbbell biceps curl reverse: listed as biceps, should be forearms
- farmers walk: listed as quads, should be forearms/traps

## 2. Wrong Instructions

**Reverse grip exercises (~15):** All "reverse grip" curls and presses describe the wrong grip. Pattern: name says "reverse grip" but instructions say "overhand" when it should be "underhand" (or vice versa).
- cable reverse curl, cable reverse one arm curl, cable reverse preacher curl, cable one arm reverse preacher curl
- barbell standing reverse grip curl (+ resistance variant)
- barbell reverse grip bent over row, barbell reverse grip incline bench row
- dumbbell reverse preacher curl, dumbbell one arm reverse preacher curl
- dumbbell reverse grip row (female) (+ hold variant), dumbbell reverse bench press
- dumbbell seated revers grip concentration curl
- smith incline reverse-grip press, smith reverse-grip press
- lever reverse grip lateral pulldown, lever reverse grip preacher curl

**Completely wrong movement described:**
- dumbbell tate press: describes seated shoulder press, should be lying tricep extension
- dumbbell reverse spider curl: describes standing curl, should be face-down on incline bench
- dumbbell lying femoral: describes supine position, should be prone
- snatch pull: describes full snatch with catch, should end at full extension
- korean dips: describes standard dips, missing bar-behind-body position
- scapula push-up / scapula dips: describe bending elbows, should keep arms straight
- superman push-up: describes bird-dog movement, should be explosive full-body-off-ground
- impossible dips: describes standard dips, missing forearm-start position
- kneeling push-up / kneeling plank tap shoulder: describe full plank position, not kneeling
- self assisted inverse leg curl: describes machine leg curl, should be Nordic curl on floor
- negative crunch: describes standard crunch, should emphasize eccentric lowering
- barbell standing concentration curl: says "hold a barbell in one hand" (impossible)
- weighted sissy squat: describes standard squat, not the leaning-back sissy squat
- three bench dip / triceps dip (between benches): only describe single-bench setup

**Name/instruction contradictions:**
- barbell alternate biceps curl: equipment is barbell but describes alternating arms (dumbbell exercise)
- bench dip (knees bent): instructions describe straight-leg version
- incline close-grip push-up: instructions say wider than shoulder-width
- incline reverse grip push-up: never mentions the reverse grip
- mixed grip chin-up: describes standard underhand grip, not mixed
- side lying hip adduction / side plank hip adduction: describe abduction (top leg), not adduction (bottom leg)
- barbell lying preacher curl: instructions describe seated, not lying
- barbell standing front raise over head: instructions say "shoulder level" not overhead
- cable wide grip rear pulldown behind neck: instructions say pull to chest
- cable standing cross-over high reverse fly: instructions say pull forward
- dumbbell biceps curl squat: omits the squat entirely
- dumbbell contralateral forward lunge: describes bilateral, not contralateral
- L-pull-up: no mention of L-sit leg position
- kettlebell double windmill: describes single kettlebell
- cable thibaudeau kayak row: describes seated, should be standing
- chest dip on straight bar: says "grab parallel bars" (should be single bar)
- weighted muscle up / muscle up: incorrect grip transition description

**Instruction quality issues:**
- dumbbell hammer curl (all variants): incorrectly say to rotate palms forward (hammer = neutral grip throughout)
- dumbbell cuban press (both variants): omit the upright row and external rotation phases
- barbell JM bench press / ez barbell JM bench press: describe standard bench press, not the hybrid movement
- barbell bradford/rocky press (both variants): describe standard overhead press, not the front-to-behind-head arc
- cable pulldown bicep curl: says curl toward thighs (should be upper chest)
- dumbbell plyo squat: describes a plyo lunge (switching feet), not a plyo squat
- high style scapula push-up / incline scapula push up: describe standard push-ups

## 3. Equipment Mismatches

**Missing stability ball from equipment array (~20 exercises):**
All dumbbell exercises performed "on exercise ball" list only `["dumbbell"]` — missing the stability ball. Includes: kickbacks, kneeling bicep curl, lying pullover, one arm chest fly, one arm fly, french press, hammer press, press, pullover, seated bicep curl, one leg fly, preacher curl, pullover hip extension, etc.

**Missing other equipment:**
- ring dips: `["body weight"]` — missing gymnastics rings
- monster walk: `["body weight"]` — instructions require resistance band
- balance board: `["body weight"]` — missing balance board
- band assisted wheel rollerout: `["band"]` — missing wheel roller
- suspended exercises (~6): `["body weight"]` — missing suspension strap/TRX
- preacher curl variants (~4): `["dumbbell"]` — missing preacher bench
- cable side bend crunch (bosu ball): `["cable"]` — missing bosu ball
- cable russian twists (on stability ball): `["cable"]` — missing stability ball
- wheel run: `["body weight"]` — should be wheel roller
- run (equipment): `["body weight"]` — name implies equipment but none listed

**Wrong equipment:**
- walking on incline treadmill: listed as `["leverage machine"]` — should be treadmill

## 4. Name Issues

**Typos:**
- "dumbbell seated revers grip concentration curl" → "reverse"
- "dumbbell revers grip biceps curl" → "reverse"
- "barbell revers wrist curl v. 2" → "reverse"
- "dumbbell peacher hammer curl" → "preacher"
- "wrist rollerer" / "controlled wrist rollerer" → "roller"
- "hug keens to chest" → "knees"
- "dumbbell incline breeding" → nonsense name, actually an incline bench press
- "kettlebell pirate supper legs" → "pirate ships"
- "left hook. boxing" → formatting error (period)
- "barbell sitted alternate leg raise" → "seated" (affects 3 variants)

**Encoding corruption:**
- "sled 45в° calf press" and 4 other sled exercises have Cyrillic `в` instead of degree symbol `°`

## 5. Secondary Muscle Errors (lower priority)

- Calf raise exercises (~3): list hamstrings/glutes as secondary — calf raises are isolation
- Band wrist curl: lists triceps as secondary — not engaged
- Band reverse wrist curl: target and secondary both say "forearms"
- Dumbbell seated lateral raise v. 2: lists triceps as secondary — not engaged in lateral raises
- L-pull-up: missing abs/hip flexors from secondary muscles
