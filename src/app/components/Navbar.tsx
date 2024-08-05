import Link from "next/link";
import { useEffect } from "react";
import { useQuery } from "react-query";
import { create } from "zustand";
import { WorkerStatus } from "@/pages/api/worker";

interface MenuItem {
  readonly name: string;
  readonly link: string;
}

interface Props {
  readonly items?: MenuItem[];
}

interface NavbarState {
  readonly workerState: WorkerStatus;
  readonly setWorkerState: (workerState: WorkerStatus) => void;
}

const useNavbarState = create<NavbarState>()((set) => ({
  workerState: {
      idleSeconds: 0,
      isIdle: true,
      lastCall: new Date(),
      now: new Date(),
      scheduleMap: {},
      futureCallMap: {}
  },
  setWorkerState: (workerState) => set({ workerState }),
}));

const fetchWorker = async () => {
  const res = await fetch("/api/worker");
  return res.json();
};

export default function Navbar({}: Props) {
  const { data: workerState } = useQuery("worker", fetchWorker);

  useEffect(() => {
    if (workerState) {
      console.log(workerState);
      useNavbarState.setState({ workerState: workerState.data });
    }
  }, [workerState]);

  return (
    <>
      <nav className="w-full bg-black py-1.5">
        <div className="container flex justify-between mx-auto w-full">
          <ul className="flex flex-row text-white justify-start gap-2">
            <li className="text-xs text-gray-500 hover:text-white">
              <a href="#"></a>
            </li>
          </ul>

          <ul className="flex flex-row text-white justify-end gap-2">
            <li className="text-xs">
              <a href="#">{workerState?.data?.isIdle === true ? <span className="text-red-300 font-medium">Offline</span> : <span>Online</span>} {workerState?.idleSeconds}</a>
            </li>
          </ul>
        </div>
      </nav>

      <nav className="w-full bg-white border-b border-b-gray-200 py-2">
        <div className="container mx-auto flex flex-row items-center gap-5">
          <Link href="/" prefetch>
            <h1 className="text-md text-red-500 select-none">
              <span className="font-semibold">M3</span>
              <span className="font-light text-red-400">Flow</span>
            </h1>
          </Link>
          <ul className="flex flex-row text-white gap-3 items-center -mb-[3px]">
            <li className="text-xs text-gray-400 hover:text-black transition-colors">
              <Link prefetch href="/call/history">
                Call History
              </Link>
            </li>
            <li className="text-xs text-gray-400 hover:text-black transition-colors">
              <a href="#">Schedule</a>
            </li>
            <li className="text-xs text-gray-400 hover:text-black transition-colors">
              <Link prefetch href="/object/list">
                Objects
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
