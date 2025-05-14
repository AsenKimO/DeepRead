// components/landing/Hero.tsx

export function Hero() {
  return (
    <section className="container flex flex-col items-center text-center gap-4">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
        Study Smarter with DeepRead
      </h1>
      <p className="max-w-[42rem] text-lg text-muted-foreground sm:text-xl">
        Upload your PDF and get an interactive AI assistant that reads along
        with you, answers questions, and helps you understand complex material.
      </p>
    </section>
  );
}
