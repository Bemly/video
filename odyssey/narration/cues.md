# Narration cue sheet

Film length 15:21.467 · 172 lines · times are positions in `out/dieji.mp4`.

"Read" is the estimated time to say the line at 2.6 words per second. Lines marked ⚠ are a tight fit for their slot.

## title

| # | Start | End | Slot | Read | English |
| ---: | --- | --- | ---: | ---: | --- |
| 1 | 00:00.000 | 00:05.533 | 5.5s | 4.6s | Today I'd like to try cramming two worlds into the same space. |

## hook1

| # | Start | End | Slot | Read | English |
| ---: | --- | --- | ---: | ---: | --- |
| 2 | 00:05.533 | 00:09.348 | 3.8s | 2.3s | Here's what I ended up with. |
| 3 | 00:09.348 | 00:15.743 | 6.4s | 3.8s | One place, two overlapping worlds: one dried out, one drowned. |
| 4 | 00:15.743 | 00:20.800 | 5.1s | 3.5s | And I have one body in each of them. |

## hook2

| # | Start | End | Slot | Read | English |
| ---: | --- | --- | ---: | ---: | --- |
| 5 | 00:20.800 | 00:25.690 | 4.9s | 2.3s | When their rules of physics disagree… |
| 6 | 00:25.690 | 00:30.365 | 4.7s | 3.8s | …space itself tears into what I'm calling a conflict field. |

## hook3

| # | Start | End | Slot | Read | English |
| ---: | --- | --- | ---: | ---: | --- |
| 7 | 00:31.367 | 00:35.827 | 4.5s | 2.7s | Also, something not entirely friendly is watching. |
| 8 | 00:35.827 | 00:40.287 | 4.5s | 3.8s | But we'll get to that. Let's start from the beginning. |

## 01 · 规则 — layers

| # | Start | End | Slot | Read | English |
| ---: | --- | --- | ---: | ---: | --- |
| 9 | 00:40.900 | 00:43.640 | 2.7s | 1.2s | First, the rules. |
| 10 | 00:43.640 | 00:48.960 | 5.3s | 3.8s | World A and world B occupy the exact same space. |
| 11 | 00:48.960 | 00:54.495 | 5.5s | 5.0s | They can't see or touch each other. Neither can interfere with the other. |
| 12 | 00:54.495 | 01:00.030 | 5.5s | 5.0s | A wall in A simply doesn't exist as far as B is concerned. |
| 13 | 01:00.030 | 01:03.700 | 3.7s | 2.3s | The one exception is the player. |

## twoBodies

| # | Start | End | Slot | Read | English |
| ---: | --- | --- | ---: | ---: | --- |
| 14 | 01:03.700 | 01:07.515 | 3.8s | 3.1s | The player exists in both worlds at once. |
| 15 | 01:07.515 | 01:13.695 | 6.2s | 5.0s | So I gave them two bodies, each colliding only with its own world. |
| 16 | 01:13.695 | 01:18.155 | 4.5s | 2.3s | The same input drives both bodies. |
| 17 | 01:18.155 | 01:23.905 | 5.8s | 3.8s | As long as the worlds agree, the bodies overlap perfectly. |
| 18 | 01:23.905 | 01:30.730 | 6.8s | 5.8s | But the moment A says 'there's a wall here' and B says 'no there isn't'… |
| 19 | 01:30.730 | 01:35.405 | 4.7s | 3.1s | …the two bodies come apart. That's a contradiction. |
| 20 | 01:35.405 | 01:41.367 | 6.0s | 4.6s | This whole video is about figuring out what to do with it. |

## 02 · 一条光线，两个世界 — data

| # | Start | End | Slot | Read | English |
| ---: | --- | --- | ---: | ---: | --- |
| 21 | 01:41.367 | 01:45.827 | 4.5s | 3.8s | First we need to see something. I'm going with voxels. |
| 22 | 01:45.827 | 01:52.222 | 6.4s | 3.5s | The whole scene is a single 128×40×64 3D texture. |
| 23 | 01:52.222 | 01:56.467 | 4.2s | 3.1s | The key idea: every cell stores two numbers. |
| 24 | 01:56.467 | 02:03.507 | 7.0s | 5.4s | One is its material in world A, the other its material in world B. |
| 25 | 02:03.507 | 02:07.922 | 4.4s | 1.5s | Two worlds, one texture. |

## dda

| # | Start | End | Slot | Read | English |
| ---: | --- | --- | ---: | ---: | --- |
| 26 | 02:07.933 | 02:12.608 | 4.7s | 3.1s | All the rendering happens in one fragment shader. |
| 27 | 02:12.608 | 02:18.358 | 5.8s | 5.8s ⚠ | Each pixel fires a ray that steps through the grid one cell at a time. |
| 28 | 02:18.358 | 02:25.398 | 7.0s | 5.4s | The algorithm is called DDA: each step lands exactly on the next cell boundary. |
| 29 | 02:25.398 | 02:33.633 | 8.2s | 5.4s | Because each cell holds two numbers, one ray learns about both worlds at once. |

## ddaCode

| # | Start | End | Slot | Read | English |
| ---: | --- | --- | ---: | ---: | --- |
| 30 | 02:33.633 | 02:37.018 | 3.4s | 2.7s | In code it looks roughly like this. |
| 31 | 02:37.018 | 02:43.198 | 6.2s | 5.4s | Compare the distance to the next boundary on each axis, and take the nearest. |
| 32 | 02:43.198 | 02:47.828 | 4.6s | 2.7s | Then read both materials for that cell. |

## grey

| # | Start | End | Slot | Read | English |
| ---: | --- | --- | ---: | ---: | --- |
| 33 | 02:47.833 | 02:50.358 | 2.5s | 1.2s | Let's run it. |
| 34 | 02:50.358 | 02:54.818 | 4.5s | 3.5s | Well, we can see blocks. That's the good news. |
| 35 | 02:54.818 | 03:00.998 | 6.2s | 6.5s ⚠ | The bad news is both worlds are mashed into one blob. You can't tell which is which. |

## styled

| # | Start | End | Slot | Read | English |
| ---: | --- | --- | ---: | ---: | --- |
| 36 | 03:01.000 | 03:08.195 | 7.2s | 4.2s | Add a palette per world, three-band cel shading, and ink outlines. |
| 37 | 03:08.195 | 03:14.590 | 6.4s | 4.6s | Much prettier, but the problem remains: which wall belongs to which world? |

## outline

| # | Start | End | Slot | Read | English |
| ---: | --- | --- | ---: | ---: | --- |
| 38 | 03:14.600 | 03:22.070 | 7.5s | 6.2s | The outlines aren't a post-process: when a ray hits a face, it checks the neighbouring cells. |
| 39 | 03:22.070 | 03:27.390 | 5.3s | 4.6s | If the neighbour is solid too, the surface is flat. No line. |
| 40 | 03:27.390 | 03:31.850 | 4.5s | 3.1s | If there's something diagonally above, it's a crease. |
| 41 | 03:31.850 | 03:36.525 | 4.7s | 3.5s | If the neighbour is empty, we've reached the silhouette. |

## ghost

| # | Start | End | Slot | Read | English |
| ---: | --- | --- | ---: | ---: | --- |
| 42 | 03:36.533 | 03:43.358 | 6.8s | 5.8s | As for telling the worlds apart: I have the player "attend" to one of them. |
| 43 | 03:43.358 | 03:46.958 | 3.6s | 2.3s | The attended world is drawn solid. |
| 44 | 03:46.958 | 03:52.278 | 5.3s | 4.2s | The other is left as glowing outlines and a little haze. |
| 45 | 03:52.278 | 03:59.103 | 6.8s | 6.5s ⚠ | A ray hitting a ghost surface doesn't stop. It picks up a little colour and keeps going. |
| 46 | 03:59.103 | 04:06.528 | 7.4s | 5.0s | And if a cell is solid in both worlds, then it's just… solid. |

## compositeCode

| # | Start | End | Slot | Read | English |
| ---: | --- | --- | ---: | ---: | --- |
| 47 | 04:06.533 | 04:10.993 | 4.5s | 2.3s | The implementation is plain front-to-back compositing. |
| 48 | 04:10.993 | 04:17.818 | 6.8s | 5.8s | Opacity depends on which world the surface belongs to, and which one we're attending to. |

## dual

| # | Start | End | Slot | Read | English |
| ---: | --- | --- | ---: | ---: | --- |
| 49 | 04:17.833 | 04:20.788 | 3.0s | 1.5s | That's a lot clearer. |
| 50 | 04:20.788 | 04:24.603 | 3.8s | 2.3s | Warm colours: the dried-out world A. |
| 51 | 04:24.603 | 04:30.998 | 6.4s | 5.4s | Tap a key to attend to the other side: the cold, drowned world B. |
| 52 | 04:30.998 | 04:37.823 | 6.8s | 5.0s | Incidentally, each world has its own sun, so the shadows point different ways. |
| 53 | 04:37.823 | 04:43.788 | 6.0s | 4.2s | Things in A cast no shadow in B, and vice versa. |
| 54 | 04:43.788 | 04:52.667 | 8.9s | 6.5s | And these residents belong to one world only, so they drift straight through the other world's walls. |

## 03 · 两个身体 — bodiesCode

| # | Start | End | Slot | Read | English |
| ---: | --- | --- | ---: | ---: | --- |
| 55 | 04:52.667 | 04:55.407 | 2.7s | 1.5s | Now for the physics. |
| 56 | 04:55.407 | 05:01.797 | 6.4s | 3.8s | Two bodies, each moving and colliding in its own world. |

## noCouple

| # | Start | End | Slot | Read | English |
| ---: | --- | --- | ---: | ---: | --- |
| 57 | 05:01.800 | 05:05.400 | 3.6s | 2.7s | Let's just run it with nothing else. |
| 58 | 05:05.400 | 05:10.075 | 4.7s | 3.8s | Walk up to a wall that only exists in A… |
| 59 | 05:10.075 | 05:15.825 | 5.8s | 3.5s | A's body is blocked. B's body just keeps going. |
| 60 | 05:15.825 | 05:19.640 | 3.8s | 2.3s | Great. I am now two people. |
| 61 | 05:19.640 | 05:22.810 | 3.2s | 3.5s ⚠ | And there's no way to put me back together. |

## spring

| # | Start | End | Slot | Read | English |
| ---: | --- | --- | ---: | ---: | --- |
| 62 | 05:23.600 | 05:28.490 | 4.9s | 3.5s | So something has to pull the bodies back together. |
| 63 | 05:28.490 | 05:32.090 | 3.6s | 2.3s | The simplest thing is a spring. |
| 64 | 05:32.090 | 05:35.475 | 3.4s | 2.7s | The further apart, the harder it pulls. |
| 65 | 05:35.475 | 05:42.455 | 7.0s | 5.8s | I made it stiffen as it stretches, so the bodies can never drift too far. |

## springCode

| # | Start | End | Slot | Read | English |
| ---: | --- | --- | ---: | ---: | --- |
| 66 | 05:42.467 | 05:45.207 | 2.7s | 2.7s ⚠ | It's only a few lines of code. |
| 67 | 05:45.207 | 05:52.400 | 7.2s | 4.6s | The force acts on A, and the opposite force acts on B. |

## noDamp

| # | Start | End | Slot | Read | English |
| ---: | --- | --- | ---: | ---: | --- |
| 68 | 05:52.400 | 05:54.710 | 2.3s | 0.8s | Try again. |
| 69 | 05:54.710 | 06:00.890 | 6.2s | 4.6s | This time B does get pulled back, and then… bounces out again. |
| 70 | 06:00.890 | 06:04.700 | 3.8s | 3.5s | The two worlds are using me as a slingshot. |

## damping

| # | Start | End | Slot | Read | English |
| ---: | --- | --- | ---: | ---: | --- |
| 71 | 06:04.700 | 06:09.805 | 5.1s | 3.1s | Here's the distance between the bodies over time. |
| 72 | 06:09.805 | 06:14.910 | 5.1s | 3.8s | A spring only stores energy and hands it straight back. |
| 73 | 06:14.910 | 06:21.660 | 6.8s | 4.6s | Add damping proportional to their relative velocity to burn that energy off. |

## damped

| # | Start | End | Slot | Read | English |
| ---: | --- | --- | ---: | ---: | --- |
| 74 | 06:21.667 | 06:23.977 | 2.3s | 0.8s | That's better. |
| 75 | 06:23.977 | 06:30.157 | 6.2s | 5.0s | A hits the wall, B leans forward a little, and is held firmly. |
| 76 | 06:30.157 | 06:34.617 | 4.5s | 3.5s | I keep pushing forward, and B can't move either. |
| 77 | 06:34.617 | 06:40.797 | 6.2s | 6.5s ⚠ | The world with the wall is reaching through the spring to restrain me in the other one. |
| 78 | 06:40.797 | 06:46.117 | 5.3s | 4.6s | Let go, and the bodies merge again, back to a stable state. |

## 04 · 冲突场 — field

| # | Start | End | Slot | Read | English |
| ---: | --- | --- | ---: | ---: | --- |
| 79 | 06:46.933 | 06:52.898 | 6.0s | 4.2s | The contradiction now has a number: the tension in the spring. |
| 80 | 06:52.898 | 06:55.853 | 3.0s | 2.3s | I want to make it visible. |
| 81 | 06:55.853 | 07:02.248 | 6.4s | 5.0s | So I added another, lower-resolution 3D texture and called it the conflict field. |
| 82 | 07:02.248 | 07:09.933 | 7.7s | 5.8s | Each frame I splat some intensity between the bodies and onto whatever they're pushing against. |
| 83 | 07:09.933 | 07:13.918 | 4.0s | 3.1s | The higher the tension, the more gets splatted. |

## fieldCode

| # | Start | End | Slot | Read | English |
| ---: | --- | --- | ---: | ---: | --- |
| 84 | 07:13.933 | 07:19.038 | 5.1s | 4.2s | On the physics side, two splats per frame, scaled by tension. |
| 85 | 07:19.038 | 07:25.003 | 6.0s | 5.0s | In the shader, every step of the ray also samples the conflict field. |
| 86 | 07:25.003 | 07:31.613 | 6.6s | 5.0s | For colour I picked an obnoxious complementary pair, drawn as moving interference bands. |
| 87 | 07:31.613 | 07:36.288 | 4.7s | 2.7s | It is, after all, two worlds interfering. |

## noDecay

| # | Start | End | Slot | Read | English |
| ---: | --- | --- | ---: | ---: | --- |
| 88 | 07:36.300 | 07:38.825 | 2.5s | 1.5s | That looks pretty good! |
| 89 | 07:38.825 | 07:42.425 | 3.6s | 2.3s | …it just doesn't seem to stop. |
| 90 | 07:42.425 | 07:49.890 | 7.5s | 4.6s | I forgot to make it decay. Everywhere I go turns permanently pink. |

## decayCode

| # | Start | End | Slot | Read | English |
| ---: | --- | --- | ---: | ---: | --- |
| 91 | 07:49.900 | 07:55.800 | 5.9s | 3.8s | Multiplying by something less than one each frame fixes it. |

## decay

| # | Start | End | Slot | Read | English |
| ---: | --- | --- | ---: | ---: | --- |
| 92 | 07:55.800 | 08:01.335 | 5.5s | 5.0s | Now the field glows with the conflict and fades once I let go. |
| 93 | 08:01.335 | 08:07.730 | 6.4s | 5.0s | I also added chromatic aberration and screen tearing, driven by the same tension. |
| 94 | 08:07.730 | 08:14.770 | 7.0s | 6.9s ⚠ | Walls touched by the field get hatched, so you can tell at a glance what's causing the argument. |
| 95 | 08:14.770 | 08:19.875 | 5.1s | 3.8s | And that lightning between the bodies is the spring itself. |

## 05 · 穿墙 — tunnel

| # | Start | End | Slot | Read | English |
| ---: | --- | --- | ---: | ---: | --- |
| 96 | 08:20.667 | 08:25.772 | 5.1s | 3.8s | As it stands, one thin wall can stop me forever. |
| 97 | 08:25.772 | 08:30.662 | 4.9s | 3.8s | That's a bit dull. What if I'm going fast enough? |
| 98 | 08:30.662 | 08:35.552 | 4.9s | 3.5s | Here's the rule: when the tension exceeds a threshold… |
| 99 | 08:35.552 | 08:39.582 | 4.0s | 3.1s | …and the bodies are still separating at speed… |
| 100 | 08:39.582 | 08:46.192 | 6.6s | 4.2s | …the blocked body 'phases out': it temporarily leaves its own world. |
| 101 | 08:46.192 | 08:52.527 | 6.3s | 5.4s | It stops colliding with its own walls and gets yanked across by the spring. |

## naiveCode

| # | Start | End | Slot | Read | English |
| ---: | --- | --- | ---: | ---: | --- |
| 102 | 08:52.533 | 09:00.567 | 8.0s | 5.0s | Version one was blunt: over the threshold, switch collision off for 0.12 seconds. |

## naive

| # | Start | End | Slot | Read | English |
| ---: | --- | --- | ---: | ---: | --- |
| 103 | 09:00.567 | 09:04.812 | 4.2s | 3.8s | Give the player a dash and try the thin wall. |
| 104 | 09:04.812 | 09:07.337 | 2.5s | 0.8s | Straight through! |
| 105 | 09:07.337 | 09:13.947 | 6.6s | 4.2s | The bodies re-merge on the far side: a new stable state. |
| 106 | 09:13.947 | 09:17.717 | 3.8s | 1.9s | What about a thicker wall? |
| 107 | 09:17.717 | 09:20.812 | 3.1s | 0.4s | …Ah. |
| 108 | 09:20.812 | 09:27.852 | 7.0s | 6.2s | The 0.12 seconds ran out, collision came back, and A's body is still inside the wall. |
| 109 | 09:27.852 | 09:33.602 | 5.8s | 3.5s | It's entombed in stone, with B's body tethered outside. |

## states

| # | Start | End | Slot | Read | English |
| ---: | --- | --- | ---: | ---: | --- |
| 110 | 09:34.200 | 09:37.370 | 3.2s | 1.9s | So a timer won't do. |
| 111 | 09:37.370 | 09:44.410 | 7.0s | 5.0s | A phased body should stay phased until it has actually left solid matter. |
| 112 | 09:44.410 | 09:52.095 | 7.7s | 5.8s | While phased, it obeys the other world's geometry instead. It's a guest there, after all. |
| 113 | 09:52.095 | 09:59.350 | 7.3s | 6.2s | Meanwhile the wall grips it like friction; only a strong enough pull can drag it through. |
| 114 | 09:59.350 | 10:05.530 | 6.2s | 6.2s ⚠ | If the pull fades before it's out, the wall spits it back the way it came. |

## phaseCode

| # | Start | End | Slot | Read | English |
| ---: | --- | --- | ---: | ---: | --- |
| 115 | 10:05.533 | 10:11.493 | 6.0s | 3.1s | In code, it's a very small state machine. |

## full

| # | Start | End | Slot | Read | English |
| ---: | --- | --- | ---: | ---: | --- |
| 116 | 10:11.500 | 10:14.025 | 2.5s | 1.2s | Thin wall: through. |
| 117 | 10:14.025 | 10:19.345 | 5.3s | 5.0s | It works the other way too: this coral wall exists only in B. |
| 118 | 10:19.345 | 10:23.805 | 4.5s | 3.1s | Thick wall: halfway in, then spat back out. |
| 119 | 10:23.805 | 10:29.340 | 5.5s | 6.9s ⚠ | How thick a wall you can pass depends entirely on how far the dash can stretch the spring. |
| 120 | 10:29.340 | 10:35.305 | 6.0s | 4.2s | I didn't hard-code that. It just falls out of the spring. |

## door

| # | Start | End | Slot | Read | English |
| ---: | --- | --- | ---: | ---: | --- |
| 121 | 10:35.900 | 10:39.500 | 3.6s | 2.7s | Which means we can build little puzzles. |
| 122 | 10:39.500 | 10:46.325 | 6.8s | 5.8s | A's thick wall has a doorway, but in B the doorway is plugged with coral. |
| 123 | 10:46.325 | 10:51.430 | 5.1s | 3.5s | Walk through A's door while smashing through B's coral. |

## stairBug

| # | Start | End | Slot | Read | English |
| ---: | --- | --- | ---: | ---: | --- |
| 124 | 10:52.233 | 10:56.908 | 4.7s | 4.2s | There was one more bug I really did not see coming. |
| 125 | 10:56.908 | 11:03.088 | 6.2s | 3.8s | Climbing stairs, I'd occasionally twitch and drop into the steps. |
| 126 | 11:03.088 | 11:10.773 | 7.7s | 6.2s | The cause: stepping up lifts A's body one cell in an instant, yanking the spring taut. |
| 127 | 11:10.773 | 11:18.667 | 7.9s | 6.9s | Tension spikes past the threshold, and A "tunnels" through its own floor as if it were a wall. |

## stairFix

| # | Start | End | Slot | Read | English |
| ---: | --- | --- | ---: | ---: | --- |
| 128 | 11:18.667 | 11:25.707 | 7.0s | 5.4s | Hence that second condition from earlier: the bodies must still be separating at speed. |
| 129 | 11:25.707 | 11:32.962 | 7.3s | 5.8s | On stairs, B is catching up rather than pulling away, so it no longer misfires. |

## 06 · 一个走路，一个游泳 — buoyancy

| # | Start | End | Slot | Read | English |
| ---: | --- | --- | ---: | ---: | --- |
| 130 | 11:32.967 | 11:38.287 | 5.3s | 4.2s | So far the worlds only differ in where their walls are. |
| 131 | 11:38.287 | 11:43.392 | 5.1s | 3.1s | It's more interesting if their physics differ too. |
| 132 | 11:43.392 | 11:50.862 | 7.5s | 3.8s | Take this sunken court: dry in A, flooded in B. |
| 133 | 11:50.862 | 11:57.257 | 6.4s | 5.4s | A's body is pulled down by gravity; B's body is pushed up by buoyancy. |
| 134 | 11:57.257 | 12:01.287 | 4.0s | 3.1s | The spring sits between them, pulled both ways. |
| 135 | 12:01.287 | 12:06.733 | 5.5s | 3.5s | They settle somewhere neither of them is happy with. |

## waterCode

| # | Start | End | Slot | Read | English |
| ---: | --- | --- | ---: | ---: | --- |
| 136 | 12:06.733 | 12:12.268 | 5.5s | 4.6s | In code, each body only feels the forces of its own world. |
| 137 | 12:12.268 | 12:17.158 | 4.9s | 3.5s | The only thing linking them is still that spring. |

## court

| # | Start | End | Slot | Read | English |
| ---: | --- | --- | ---: | ---: | --- |
| 138 | 12:17.167 | 12:19.477 | 2.3s | 1.5s | Walking into the court. |
| 139 | 12:19.477 | 12:25.872 | 6.4s | 5.0s | In A I'm on dry ground, and yet my body slowly lifts off. |
| 140 | 12:25.872 | 12:32.912 | 7.0s | 5.4s | The conflict field stays lit but steady: a state that's 'close enough' to balance. |
| 141 | 12:32.912 | 12:37.157 | 4.2s | 3.8s | In A there's a low wall too high to jump. |
| 142 | 12:37.157 | 12:42.692 | 5.5s | 3.8s | But B's buoyancy can carry A's body right over it. |
| 143 | 12:42.692 | 12:48.012 | 5.3s | 4.2s | Next, B has a reef ceiling that can't be swum over. |
| 144 | 12:48.012 | 12:55.697 | 7.7s | 5.8s | Now A's weight helps out: hold dive, and it drags B's body to the bottom. |
| 145 | 12:55.697 | 13:01.662 | 6.0s | 5.0s | Walking in one world, swimming in the other, each dragging the other along. |

## courtB

| # | Start | End | Slot | Read | English |
| ---: | --- | --- | ---: | ---: | --- |
| 146 | 13:02.667 | 13:06.482 | 3.8s | 2.7s | Here's how it looks from B's side. |
| 147 | 13:06.482 | 13:14.800 | 8.3s | 6.2s | The rings on the water, by the way, are just a few sines in the shader. |

## 07 · 世界自己会修正 — reconcile

| # | Start | End | Slot | Read | English |
| ---: | --- | --- | ---: | ---: | --- |
| 148 | 13:14.800 | 13:17.540 | 2.7s | 1.2s | One last idea. |
| 149 | 13:17.540 | 13:24.795 | 7.3s | 5.8s | Right now contradictions are permanent: the wall is forever in A and never in B. |
| 150 | 13:24.795 | 13:28.610 | 3.8s | 2.3s | What if the worlds corrected themselves? |
| 151 | 13:28.610 | 13:33.715 | 5.1s | 4.6s | I track a 'stress' value for each voxel involved in a contradiction. |
| 152 | 13:33.715 | 13:40.755 | 7.0s | 7.3s ⚠ | Keep pushing on a wall until the stress fills up, and that voxel gets written into the other world. |
| 153 | 13:40.755 | 13:44.355 | 3.6s | 3.1s | Both sides now have a wall. Contradiction gone. |
| 154 | 13:44.355 | 13:51.180 | 6.8s | 4.6s | Conversely, if you phase through, the voxels you passed are erased outright. |
| 155 | 13:51.180 | 13:56.025 | 4.8s | 3.1s | Neither side has a wall. Contradiction also gone. |

## reconcileCode

| # | Start | End | Slot | Read | English |
| ---: | --- | --- | ---: | ---: | --- |
| 156 | 13:56.033 | 14:03.498 | 7.5s | 3.8s | Either way, the worlds converge towards agreeing with each other. |

## imprint

| # | Start | End | Slot | Read | English |
| ---: | --- | --- | ---: | ---: | --- |
| 157 | 14:03.500 | 14:07.745 | 4.2s | 3.5s | Lean on this membrane that only exists in B. |
| 158 | 14:07.745 | 14:11.130 | 3.4s | 1.5s | The field gets brighter… |
| 159 | 14:11.130 | 14:16.880 | 5.8s | 4.2s | …and then it sets. These cells now belong to both worlds. |
| 160 | 14:16.880 | 14:20.050 | 3.2s | 2.3s | Move over and dash through instead. |
| 161 | 14:20.050 | 14:23.220 | 3.2s | 2.3s | This time it leaves a hole. |
| 162 | 14:23.220 | 14:29.400 | 6.2s | 4.6s | Walk around enough and I'll eventually grind the two worlds into one. |

## eye

| # | Start | End | Slot | Read | English |
| ---: | --- | --- | ---: | ---: | --- |
| 163 | 14:30.000 | 14:32.955 | 3.0s | 2.3s | There is one small problem, though. |
| 164 | 14:32.955 | 14:39.350 | 6.4s | 5.8s | With every conflict and every correction, that thing in the sky opens a little wider. |
| 165 | 14:39.350 | 14:43.595 | 4.2s | 3.8s | It doesn't belong to A. It doesn't belong to B. |
| 166 | 14:43.595 | 14:49.990 | 6.4s | 5.8s | It lives in the gap between them, and I've been helpfully prying that gap open. |
| 167 | 14:49.990 | 14:54.450 | 4.5s | 3.5s | …I've decided not to fix that bug for now. |

## outro

| # | Start | End | Slot | Read | English |
| ---: | --- | --- | ---: | ---: | --- |
| 168 | 14:55.967 | 14:59.352 | 3.4s | 1.9s | And that's everything so far. |
| 169 | 14:59.352 | 15:06.392 | 7.0s | 4.6s | There's lots more to try: different gravity directions, different rates of time… |
| 170 | 15:06.392 | 15:09.347 | 3.0s | 1.5s | Or a third world. |
| 171 | 15:09.347 | 15:16.172 | 6.8s | 6.2s | The demo and source are in the project folder if you'd like to walk around yourself. |
| 172 | 15:16.172 | 15:18.482 | 2.3s | 1.2s | Thanks for watching. |
