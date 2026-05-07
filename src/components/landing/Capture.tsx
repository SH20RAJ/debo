"use client";

import {
  CalendarPlus,
  Camera,
  Mic2,
  PlugZap,
  UploadCloud,
  Video,
  WandSparkles,
} from "lucide-react";

const captureModes = [
  {
    icon: Mic2,
    label: "Audio journal",
    detail: "Brain dump while walking, driving, or winding down.",
    color: "text-duo-green",
    borderColor: "border-duo-feather",
  },
  {
    icon: Video,
    label: "Video journal",
    detail: "Record a private vlog and let Debo pull out memories.",
    color: "text-duo-blue",
    borderColor: "border-duo-macaw",
  },
  {
    icon: Camera,
    label: "Diary scans",
    detail: "Upload notebook pages and images for later OCR.",
    color: "text-duo-orange",
    borderColor: "border-duo-fox",
  },
];

const actionExamples = [
  "Transcribe recordings into journal entries",
  "Extract memories, people, dates, and tasks",
  "Create calendar events after you approve",
  "Use connected apps as context for Debo",
];

export function Capture() {
  return (
    <section className="bg-background py-24 border-t-2 border-duo-swan">
      <div className="container mx-auto max-w-6xl px-6">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-xl border-2 border-duo-swan bg-duo-polar px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-duo-wolf">
              <WandSparkles className="h-4 w-4 text-duo-purple" />
              Next capture layer
            </div>

            <div className="space-y-5">
              <h2 className="text-3xl font-heading font-black leading-tight text-duo-eel md:text-5xl">
                Journal faster than typing.
              </h2>
              <p className="max-w-xl text-lg font-bold leading-relaxed text-duo-wolf">
                Debo is being shaped into a multimodal life inbox: record live,
                upload a voice note, drop in a diary photo, and let the system
                turn raw moments into searchable context.
              </p>
            </div>

            <div className="grid gap-3">
              {captureModes.map(({ icon: Icon, label, detail, color, borderColor }) => (
                <div
                  key={label}
                  className="flex items-center gap-4 rounded-xl border-2 border-duo-swan bg-duo-snow p-4"
                >
                  <div className={`rounded-xl border-2 ${borderColor} bg-duo-polar p-3 ${color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-heading text-base font-black text-duo-eel">
                      {label}
                    </h3>
                    <p className="text-sm font-bold leading-snug text-duo-wolf">
                      {detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border-2 border-duo-swan bg-duo-polar p-4 shadow-[0_6px_0_var(--duo-swan)]">
            <div className="rounded-2xl border-2 border-duo-swan bg-duo-snow p-5 md:p-7">
              <div className="mb-6 flex items-center justify-between border-b-2 border-duo-swan pb-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-duo-hare">
                    Example flow
                  </p>
                  <h3 className="text-xl font-heading font-black text-duo-eel">
                    Live vlog to action
                  </h3>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-duo-macaw bg-duo-blue/10 text-duo-blue">
                  <Video className="h-5 w-5" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-xl border-2 border-duo-swan bg-background p-4">
                  <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-duo-red">
                    <span className="h-2.5 w-2.5 rounded-full bg-duo-red" />
                    Recording
                  </div>
                  <p className="text-base font-bold leading-relaxed text-duo-eel">
                    "Make me remember that I have to attend the product review
                    meeting today at 5."
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {actionExamples.map((item, index) => (
                    <div
                      key={item}
                      className="rounded-xl border-2 border-duo-swan bg-duo-polar p-4"
                    >
                      <div className="mb-3 flex h-7 w-7 items-center justify-center rounded-lg bg-duo-snow text-xs font-black text-duo-blue">
                        {index + 1}
                      </div>
                      <p className="text-sm font-black leading-snug text-duo-eel">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex items-center gap-3 rounded-xl border-2 border-duo-feather bg-duo-green/10 p-4">
                    <CalendarPlus className="h-6 w-6 text-duo-green" />
                    <p className="text-sm font-black leading-snug text-duo-eel">
                      Calendar draft created
                    </p>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl border-2 border-duo-beetle bg-duo-purple/10 p-4">
                    <PlugZap className="h-6 w-6 text-duo-purple" />
                    <p className="text-sm font-black leading-snug text-duo-eel">
                      Connector actions ready
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl border-2 border-duo-swan bg-background p-4">
                  <UploadCloud className="h-5 w-5 text-duo-orange" />
                  <p className="text-sm font-bold text-duo-wolf">
                    Upload recordings, images, and diary pages now in the
                    roadmap so future context capture can happen in minutes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
