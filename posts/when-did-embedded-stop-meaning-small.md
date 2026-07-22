---
title: "When Did Embedded Stop Meaning Small?"
slug: when-did-embedded-stop-meaning-small
date: 2026-06-16
description: "The old definition of embedded (small, slow, constrained) is dead. What actually separates an embedded system from a computer in 2026?"
status: published
post_type: field-notes
tags: [embedded-linux]
---

It was only in the early 1990s that I got my hands on a computer for the first time. It was a 486 DX2 with 8 MB of RAM, an almost absurd amount of memory for the time, and one of the best machines you could buy in Brazil once the country started opening its economy to imports. A large box connected by wires to a large CRT monitor, running the most modern system of its time: Windows 3.11, itself sitting on top of MS-DOS.

Back then I didn't even have the concept of an "embedded system" in my head. But let me look back at the things that surrounded me in those years and try to pick out a few of the embedded devices among them.

I did not grow up surrounded by ultra-high-tech gadgets or appliances, since we were an average middle-class Brazilian family. And being so young, I had no real way of knowing what was running under the hood of my father's car, or inside the appliances around the house. So let me start with my own corner, where I already had two game consoles. The older one was a CCE VG-3000, a Brazilian Atari 2600 clone (a MOS 6507 and all of 128 bytes of RAM); the newer one, a Dynacom Dynavision 3, an NES clone (a 6502-derived CPU with 2 KB of RAM). Both were local workarounds, products of Brazil's *reserva de mercado de informática*, the protectionist policy that walled off imported electronics through the 1980s and left us with a homegrown industry of clones. A SNES joined the two consoles a few years later, as best I can remember, after we already had the 486; by then the market was opening and you could finally buy the real thing.

![A CCE VG-3000 and a Dynacom Dynavision 3 side by side](/images/consoles.jpg)
*Left: my CCE VG-3000, a Brazilian Atari 2600 clone (MOS 6507, 128 bytes of RAM). Right: my Dynacom Dynavision 3, an NES clone (6502-derived CPU, 2 KB of RAM), with its box, light gun, and controller.*

For obvious reasons, those consoles are the devices I remember most clearly; they made so many of my afternoons enjoyable. But, putting them aside for a moment, a whole range of electronics filled the homes around me. In a middle-class Brazilian living room, the things that simply could not be missing were a good color TV, a VCR, and a shiny sound system.

None of us thought of these as computers, yet each one was built around a microcontroller doing exactly the kind of work I would later learn to call embedded. The shiny sound system, a component stereo like the **Sony HCD-VX555**, leaned on a single master-control chip (a Mitsubishi M30620MCA-A95FP, from the 16-bit M16C/62 family) to read the keypad, drive the display, command the tuner, move the CD transport, and decode the remote. The VCR was the same idea in a different box: a unit like the **JVC SR-VS30E** handed its entire front panel, clock, tuner presets, remote decoding, and tape-transport timing to one Hitachi HD6432194SBD26F system-control microcomputer, an 8/16-bit part from Hitachi's H8/300 family.

![A Sony component stereo and a JVC S-VHS deck side by side](/images/stereo-vcr.jpg)
*Left: a Sony HCD-VX555 component stereo, its keypad, display, tuner, and CD transport all marshalled by one Mitsubishi M16C chip. Right: a JVC SR-VS30E S-VHS/MiniDV deck, whose front panel, clock, and tape transport answer to a single Hitachi H8 microcontroller.*

Moving to the garage, more and more families were becoming able to own a car. Models like the **Fiat Uno**, and later the Palio, had a Magneti Marelli IAW electronic fuel-injection unit. At its heart sat a Motorola MC68HC11F1 microcontroller, quietly running the engine every time the car turned over.

All of them were genuinely advanced for their day, and all of them were embedded systems: single-chip microcontrollers with kilobytes of on-chip RAM and clocks in the single- to low-double-digit megahertz, each one devoted to a single job. Pretty limited next to my powerful 486 DX2. And that gap, the obvious distance between a "real computer" and the chips hidden inside everything else, is exactly the thing this post is about.

Now jump to today. What counts as an embedded device? A few examples, from the smallest end to the largest:

- A smart plug or bulb, sold in any Brazilian home-improvement store, with a Wi-Fi microcontroller such as the Espressif ESP32 inside: a dual-core part at a few hundred megahertz, hundreds of kilobytes of SRAM, Wi-Fi and Bluetooth on a single die.
- A rooftop solar microinverter, the kind now bolted under panels on Brazilian roofs in the recent solar boom, on a power-control-class microcontroller such as an ST STM32 (a Cortex-M with hardware math accelerators) or a dedicated digital signal controller, running hard real-time MPPT and grid-sync loops on bare metal or a small RTOS, no Linux in sight.
- The *maquininha* card reader in every shop, with a 64-bit ARM SoC behind the screen: a locked-down Linux or Android stack, hundreds of megabytes of RAM, a SIM, and often a thermal printer.
- The infotainment stack in a modern car, running on an automotive SoC with several 64-bit cores and a dedicated GPU.

![A Cielo card reader and a VW infotainment screen side by side](/images/maquininha-carplay.jpg)
*Left: a Cielo maquininha, a 64-bit ARM SoC behind the screen running a locked-down Android, with a SIM and a thermal printer. Right: a VW infotainment system on an automotive SoC with several 64-bit cores and a dedicated GPU.*

The same story repeats in the TV box from your cable operator, the self-service totems in bank branches, and the PLCs bolted inside factory machines.

The phone in our pockets belongs on this list too, and so do the graphing calculators (the HP 48/49, or the Texas Instruments TI-8x series) that got me through college. They are embedded systems as well, but a special case, so I'll set them aside for a moment and come back to them shortly.

Every one of these modern devices is hundreds to thousands of times more powerful than my old 486, which was (and still is!) a desktop, a real computer, just an old one. Yet we file these far more capable parts under "embedded systems." So if memory and compute are not enough to label something as an embedded device, what actually changed in the meaning of the word?

It helps to start with what has not changed. The first constant is specificity. Even when these devices are built on general-purpose microcontrollers or processors, they are designed to do one job, or a narrow set of jobs. You don't reach for a kiosk to browse the web. You arguably could, but you'd grab your laptop instead. (Your phone blurs this, but hold that thought.)

The second constant is closeness to the electronics. A specialized system needs specialized hardware to support it, so embedded work still assumes some understanding of the circuit you're dropping your code into, and some comfort with a multimeter, an oscilloscope, a soldering iron. That was true then and it's true now. The tooling has gotten kinder: better documented, more available, and often a vendor hands you a carrier board and a USB cable and you're running in minutes. But you're still standing next to the hardware in a way a desktop programmer never is. That part of the job is constant.

Which is why phones and calculators are a special class: they carry two kinds of developer at once. There are the people who bring up the board and build the platform, and for them these devices are ordinary embedded systems. And there are the people writing apps to run on top of that platform. A phone or calculator app developer is no closer to a soldering iron than a web developer is.

So, back to our question: if specificity and closeness to the hardware stayed the same, and the jump in memory and compute is real but not what makes a system embedded, then what actually changed? To see it, it helps to go back to the definition we all started with.

## The definition we all learned

If you picked up an embedded systems textbook twenty years ago, the shorthand was comfortingly concrete. An embedded system was:

- **Resource-constrained.** Kilobytes of RAM, maybe a few megahertz. Every byte was negotiated.
- **Fixed-function.** It did one thing. A washing machine controller washed clothes. It was never going to do anything else.
- **OS-less, or nearly so.** Bare metal, or a small RTOS if you were fancy. No MMU, no processes, no users.
- **Invisible.** The user bought a VCR, not a computer. If they ever thought about the software, something had gone wrong.

This shorthand worked because the hardware enforced it. The gap between a microcontroller and a workstation was so wide that you could not confuse them. They had different instruction sets, different toolchains, different engineers, different conferences. The boundary policed itself.

Then the hardware stopped cooperating.

## The boundary stopped holding

Compute got absurdly cheap. A quad-core 64-bit SoC with a gigabyte of RAM costs less today than a mid-range 8-bit microcontroller cost in 2000, inflation-adjusted or not. The "constrained" pillar of the definition quietly collapsed, and it took the others down with it.

Consider a few systems and try to classify them honestly:

**A retail kiosk** running stock Ubuntu on an off-the-shelf Celeron board. Standard x86, standard distro, standard package manager. By the old shorthand, this is just a PC bolted to a wall. But it ships as a product, runs one application forever, has no keyboard, and when it misbehaves someone drives a van to it. That *feels* embedded.

**A smart TV.** It has an app store, a web browser, user accounts, and over-the-air updates. It is general-purpose in every way that matters to its OS. Yet nobody in the industry hesitates to call TV platform work "embedded development," and they're right, because the team building it does board bring-up, fights thermal budgets, and ships a BSP.

**A fleet of GPU modules** running Kubernetes at the edge of a factory network, doing ML inference on camera feeds. Containers, orchestration, observability stacks, the full cloud-native liturgy. On hardware that's cross-compiled, fanless, DIN-rail mounted, and expected to survive a decade of vibration and heat. Embedded? The deployment model says no; everything physical about it says yes.

**Your phone.** By the classic definition (dedicated hardware, custom SoC, vendor-controlled software stack, battery and thermal constraints dominating every design decision), a phone is the most aggressively embedded device you own. Nobody calls it that. The moment a device becomes a *platform* in the user's mind, we stop using the word, regardless of what the engineering looks like.

If a definition classifies a phone as embedded and struggles with a kiosk, the definition is measuring the wrong things.

## The constraints didn't disappear, they moved

Here's what I think actually happened. "Embedded" was never really about small CPUs. Small CPUs were just the most *visible* constraint, so we defined the field by them. When compute got cheap, the visible constraint vanished, but the underlying ones didn't. They just stopped living in the datasheet.

The constraints that still separate embedded work from everything else, in my experience:

**The computer is subordinate to the product.** An embedded system is one where the user is buying a *device* (a scanner, a vehicle, an instrument, a machine), and the computer inside has no identity of its own. Nobody chooses a dishwasher for its OS. This sounds philosophical, but it has hard engineering consequences: the software's job is to disappear, and every visible behavior of the software (boot time, latency, noise, glitches) is judged as a property of the physical product.

**You ship once, then live with it.** A web service deploys on Tuesday and again on Thursday. An embedded product ships, and then the unit on a factory floor in another country has to keep working for ten or fifteen years. Updates exist, but each one is a risk event: power can fail mid-write, the device must never brick, and there is no operator standing by. The entire discipline of A/B partitions, watchdogs, and atomic update schemes exists because *"have you tried turning it off and on again"* is not available as a support strategy.

**Someone on the product side owns the platform.** On a server or a desktop, the operating system is usually somebody else's product; you start from a running system. In embedded work, the running system is part of what the product team ships. Sometimes that means you personally own the bootloader, kernel, device trees, and root filesystem; sometimes a BSP or platform team owns them. Either way, the organization cannot treat the OS as generic infrastructure in the same way a web app can. This is the practical reason "embedded Linux engineer" is a job title and "Ubuntu user" is not: owning the stack from reset vector to application is a different activity from developing on top of one.

**The physics bills you directly.** A cloud service that needs more capacity scales horizontally and the cost appears on an invoice. An embedded device that needs more capacity needs a bigger battery, a heatsink, a four-layer board, a different enclosure, or it needs you to write better software. Power, thermal, BOM cost multiplied by a million units, real-time deadlines enforced by mechanical reality: these constraints never relaxed. Time is physical too: a missed deadline is not just latency on a graph. It can be a motor step, a dropped frame, a bad measurement, or a watchdog reset. A fast CPU doesn't free you from these constraints. It just relocates the bottleneck and raises expectations.

Notice that none of these mention RAM size. The Fiat Uno's engine controller met every one of them with an 8-bit chip and a few kilobytes of RAM. A modern car's infotainment stack meets the same constraints with eight 64-bit cores and gigabytes to spare. That's not a contradiction of "embedded": that's just what embedded looks like now.

## A litmus test instead of a boundary

So when someone asks me whether a given system is "really" embedded, I've stopped looking at the hardware. I ask questions like:

- If this device fails in the field, is the fix a support ticket, or a technician driving out to it?
- Does the team control the software stack below the application, or consume it?
- When the product was designed, did physical constraints (power, heat, cost, space, deadlines) shape the software architecture, or did the software get to assume the hardware would accommodate it?
- Ten years from now, is this exact binary expected to still be running, unattended, on this exact board?

The more of those that land on the first option, the more embedded the system is. The reverse is useful too: a laptop in a factory running a dashboard is not automatically embedded just because it is near machinery. If it can be replaced by another laptop, updated like a laptop, administered like a laptop, and understood by users as a computer, the embeddedness is weak.

It's a spectrum, not a binary, and it always was. Bare-metal microcontrollers sit at one end, an RTOS in the middle, embedded Linux past that, and edge servers shading into "just infrastructure" at the far side. The interesting work, for me, has mostly lived in the blurry middle of that spectrum: systems big enough to run Linux and small enough that you own every byte of it.

Which is, I suspect, why embedded Linux people are the ones who end up arguing about this definition. We work precisely on the boundary that dissolved.

## Why the label still matters

It would be easy to conclude that the word is obsolete, that it's all "just computers" now, and the distinction is nostalgia. I don't buy that, and the reason is failure modes.

When a developer with a pure server-side background ships their first device firmware, the bugs they write are predictable: an update path that assumes the network is reliable, logging that assumes the disk is infinite, a recovery flow that assumes a human can intervene. None of these are stupidity. They're habits formed in an environment where those assumptions are *true*. The label "embedded" is, at its core, a warning that those assumptions don't hold here. The machine you're programming will be alone, far away, for a very long time, inside something that someone bought without knowing your software exists. Knowing that going in is most of what separates firmware that survives the field from firmware that generates support tickets from another continent.

That was true when embedded meant 2 KB of SRAM. It's still true with eight cores. The kilobytes were never the point; the *consequences* were.

For the most extreme version of this, look up. Voyager 1 launched in 1977 and is now more than 24 billion kilometers away, the most distant human-made object there is: a single radio command takes around 22 hours just to arrive. In 2024, after the probe started sending home gibberish, engineers traced the fault to one failed memory chip in its Flight Data Subsystem, then rewrote the affected code, relocated it around the dead memory, and uplinked the patch across interstellar space ([Voyager's 15-billion-mile software update](https://www.youtube.com/watch?v=_CPxe8yql0Q)). A firmware update to a 47-year-old computer no human will ever touch again, with a two-day round trip just to learn whether it worked. That is the embedded promise carried to its absolute limit: ship once, then live with it, for as long as the hardware lasts and from however far away it ends up.

@[youtube](_CPxe8yql0Q "Voyager's 15-billion-mile software update")

So: when did embedded stop meaning small? Sometime in the last two decades, gradually, while we were busy porting things. What it means now is not small. It means *committed*: software wedded permanently to a physical object and its fate. The systems got bigger. The promise they have to keep didn't get any easier.

## Further reading

If you want to dig into the idea itself, or chase down the specific chips named in the introduction:

- **On what "embedded" means.** Wind River's overview gives the standard definition and walks the layered architecture (processor, hardware abstraction layer, OS, service layer, application), then traces the same drift this post is about, out through IoT and the "intelligent edge" ([What Are Embedded Systems?, Wind River](https://www.windriver.com/solutions/learning/embedded-systems)). For the textbook version of the definition the post pushes against, the Wikipedia entry is a fair summary ([Embedded system, Wikipedia](https://en.wikipedia.org/wiki/Embedded_system)).
- **Magneti Marelli IAW in Brazil.** Brazilian-market Fiat models (Uno, Palio, Fiorino) ran Magneti Marelli's IAW electronic fuel injection. The IAW 1G7 schematic for the 1994-1998 Palio/Uno puts a Motorola 68HC11 at the center of the module, and repair teardowns of that ECU identify the specific MC68HC11F1 variant ([Esquema Elétrico Magneti Marelli IAW 1G7, Scribd](https://www.scribd.com/document/248213314/Magneti-Marelli-IAW-1G7); [reading the HC11F1 in an IAW 1G7, YouTube](https://www.youtube.com/watch?v=kqKCgqF0zzg); [Motorola 68HC11, Wikipedia](https://en.wikipedia.org/wiki/Motorola_68HC11)).
- **Living-room MCUs.** The system-control microcontrollers named above come straight from the service manuals. The Sony HCD-VX555 manual lists IC501, a Mitsubishi M30620MCA-A95FP (M16C/62 family), as the master control, with a full pin-function table for the keypad, tuner, CD transport, and display ([ManualsLib, p.51](https://www.manualslib.com/manual/838923/Sony-Hcd-Vx555.html?page=51)). The JVC SR-VS30E manual shows IC3001, a Hitachi HD6432194SBD26F (H8/300 family), as the VHS system-control micro driving the drum, capstan, and loading mechanism ([ManualsLib, p.104](https://www.manualslib.com/manual/2513743/Jvc-Sr-Vs30e-Ek.html?page=104)).

---
*I work on embedded Linux systems, the blurry middle of the spectrum described above. If you think the definition should be drawn somewhere else entirely, I'd genuinely like to hear the argument.*
