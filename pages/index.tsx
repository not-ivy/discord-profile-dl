import Head from "next/head";
import Image from "next/image";
import { useEffect, useRef, useState } from "react"
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import type DiscordUser from "../types/discord";

export default function Index() {
  const [lookupResult, setLookupResult] = useState<DiscordUser[] | undefined>(undefined);
  const [formError, setFormError] = useState(false);
  const { executeRecaptcha } = useGoogleReCaptcha();
  const inputRef = useRef(null);

  const sendRequest = async () => {
    if (!executeRecaptcha) return;
    if (!inputRef || !inputRef.current.value) { setFormError(true); return }
    console.log(!inputRef.current.value);
    const token = await executeRecaptcha();
    fetch(`${window.location.href}/api/requestBulk`, {
      method: 'POST',
      body: JSON.stringify({
        idList: inputRef.current.value.split('\n'),
        captcha: token
      })
    })
      .then((res) => res.json())
      .then((data: DiscordUser | DiscordUser[]) => {
        if (!Array.isArray(data)) { setLookupResult([data]); return }
        setLookupResult(data);
      })
  }

  useEffect(() => {
    console.log(lookupResult);
  }, [lookupResult])

  const inputCallback = () => {
    if (formError) { setFormError(false); return }
  }

  return (
    <>
      <Head>
        <title>Download discord user's profile</title>
      </Head>
      <div className="max-w-screen-md mx-auto p-4 lg:p-8 bg-white dark:bg-black text-black dark:text-white">
        <h2 className="my-4 text-3xl font-bold italic">Input ID here:</h2>
        <textarea onInput={inputCallback} className={`my-2 p-2 font-medium outline-dashed w-full dark:bg-black text-black dark:text-white ${formError ? 'dark:outline-red-500 outline-red-500 text-red-500 dark:text-red-500' : ''} dark:outline-white outline-black transition-all`} ref={inputRef} placeholder="List of Discord IDs seperated by space" /> <br />
        <button className="my-2 p-2 transition-colors dark:outline-white outline-black dark:hover:bg-white dark:hover:text-black dark:hover:border-black cursor-pointer outline-dashed font-bold" onClick={sendRequest}>Submit</button>
        {!lookupResult ? <></> : lookupResult.map((user) => (
          <div className="grid grid-cols-5 gap-x-4 p-4 grid-rows-3 w-full h-40 my-4 outline-dashed dark:outline-white outline-black" key={`user-${user.id}`}>
            <div className="col-span-1 row-span-3 relative">
              <Image className="rounded-full" alt={user.username} src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.webp?size=1024`} layout="fill" objectFit="contain" />
            </div>
            <div className="flex flex-col justify-center items-center col-span-4 row-span-3">
              {!user.banner ? <></> : (
                <div className="relative w-full h-full">
                  <Image src={`https://cdn.discordapp.com/banners/${user.id}/${user.banner}.webp?size=1024`} layout="fill" objectFit="contain" />
                </div>
              )}
              <span>{user.username}#{user.discriminator}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
