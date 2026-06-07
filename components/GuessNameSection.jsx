import FeatureCard from "@/components/FeatureCard";
import GuessNameGame from "@/components/games/GuessNameGame";

/** @deprecated Use GuessNameGame inside GameModal instead. */
export default function GuessNameSection() {
  return (
    <section className="w-full" aria-labelledby="guess-name-heading">
      <FeatureCard>
        <h2
          id="guess-name-heading"
          className="font-display text-2xl font-bold text-aira-navy sm:text-3xl"
        >
          Guess my name?
        </h2>
        <div className="mt-4">
          <GuessNameGame />
        </div>
      </FeatureCard>
    </section>
  );
}
