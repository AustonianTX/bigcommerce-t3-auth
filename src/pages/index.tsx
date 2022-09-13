import type { NextPage } from "next";
import { useProducts } from "../lib/hooks";

const Home: NextPage = () => {
  // TODO: figure out how to persist data

  // COMMIT THIS PROJECT TO GITHUB

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow">
      <div className="px-4 py-5 sm:p-6">Hello World</div>
    </div>
  );
};

export default Home;
