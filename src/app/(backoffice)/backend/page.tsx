import { headers } from "next/headers";

export default function Home() {
  console.log(headers())
  return (
    <>
      <h1 className="text-center my-8">Administration du site web</h1>
    </>

  );
}
