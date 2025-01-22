import { HeroForm } from '@/components/form';
import * as m from '@/paraglide/messages';

const Home = () => {
  return (
    <section className="container mt-10 flex flex-col items-center gap-3 text-center md:absolute md:left-1/2 md:top-1/2 md:mt-0 md:-translate-x-1/2 md:-translate-y-1/2">
      <h1 className="mb-1 font-mono text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
        {m.nextjs_starter_template_headline()}
      </h1>
      <p className="text-muted-foreground max-w-2xl">
        {m.nextjs_starter_template_description()}
      </p>
      <div className="mt-1">
        <HeroForm session={'1'} />
      </div>
    </section>
  );
};

export default Home;
