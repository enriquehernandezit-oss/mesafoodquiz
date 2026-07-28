import Image from "next/image";
import { ARCHETYPES, type ArchetypePersona } from "@/lib/quiz-config";
import { resolveArchetypePhotoPath } from "@/lib/photos";
import { NoiseOverlay } from "./NoiseOverlay";

export function ResultCard({ archetype }: { archetype: ArchetypePersona }) {
  const photo = resolveArchetypePhotoPath(archetype.slug);
  const idx = ARCHETYPES.findIndex((a) => a.slug === archetype.slug) + 1;

  return (
    <>
      <div className="relative h-[640px] animate-[mIn_.6s_both] overflow-hidden">
        {photo ? (
          <div
            className="absolute inset-0 animate-[mZoom_1.8s_cubic-bezier(.2,.7,.2,1)_both]"
            style={{
              backgroundImage: `url('${photo}')`,
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
            }}
          />
        ) : (
          <div className="absolute inset-0 bg-mesa-maroon" />
        )}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(rgba(21,0,0,.35) 0%, rgba(33,1,4,.55) 42%, rgba(21,0,0,.94) 100%)",
          }}
        />
        <NoiseOverlay opacity={0.17} />

        <div className="absolute inset-0 flex flex-col justify-between p-[30px]">
          <div className="flex items-start justify-between">
            <Image
              src="/branding/mesa-wordmark-cream.png"
              alt="mesa"
              width={78}
              height={20}
              className="h-auto w-[78px]"
            />
            <div
              className="animate-[mSeal_.7s_.4s_cubic-bezier(.2,.7,.2,1)_both] rounded-full border border-mesa-cream/55 px-[13px] py-[7px] font-mono text-[8.5px] tracking-[.24em] text-mesa-cream"
              style={{ transform: "rotate(-8deg)" }}
            >
              TIPO 0{idx} / 05
            </div>
          </div>
          <div>
            <p className="m-0 mb-3 animate-[mFadeUp_.5s_.2s_both] font-mono text-[9.5px] tracking-[.34em] text-mesa-cream/66">
              ERES
            </p>
            <h1 className="m-0 animate-[mRise_.8s_.3s_cubic-bezier(.2,.7,.2,1)_both] text-balance font-serif text-[62px] font-medium leading-[.92] tracking-[-.025em] text-mesa-cream">
              {archetype.name}
            </h1>
            <p className="mt-[18px] animate-[mFadeUp_.7s_.52s_both] text-pretty border-l-2 border-mesa-gold pl-[14px] font-serif text-base italic leading-[1.45] text-mesa-cream/92">
              {archetype.quote}
            </p>
            <div className="mt-[22px] flex animate-[mIn_.6s_.7s_both] items-center justify-between font-mono text-[9px] tracking-[.26em] text-mesa-cream/50">
              <span>@MESA.SOCIAL</span>
              <span>SANTO DOMINGO</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-mesa-maroon-deep px-6 pt-[26px]">
        <p className="m-0 text-pretty font-sans text-[13px] leading-[1.7] text-mesa-cream/66">
          {archetype.description}
        </p>
      </div>
    </>
  );
}
