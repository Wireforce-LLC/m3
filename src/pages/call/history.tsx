import Navbar from "@/app/components/Navbar";
import _ from "lodash";
import moment from "moment";
import prettyMilliseconds from "pretty-ms";
import { useQuery } from "react-query";

const fetchHistory = async () => {
  const res = await fetch("/api/call/history");
  return res.json();
};

export default function CallHistory() {
  const { data, isError, isFetched, isLoading } = useQuery(
    "files",
    fetchHistory
  );


  return (
    <main className="w-full">
      <Navbar />

      <div className="flex flex-row w-full container mx-auto py-6 divide-x divide-gray-50">
        <div className="w-full">
          <div className="w-full border border-gray-200 rounded border-b-2">
          <table className="table-auto w-full text-xs">
            <thead>
              <tr className="text-left">
                <th className="px-2 py-1">Call ID</th>
                <th className="px-2 py-1">Result</th>
                <th className="px-2 py-1">Call at</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
            {_.isArray(data?.data) &&
            data?.data?.map((entry: any) => {
              return (
                // <div className="w-full flex flex-row justify-between">
                //   <div>{entry.callId}</div>
                //   <div>{prettyMilliseconds(entry.pmillis || 0)}</div>
                //   <div>{entry.objectHash}</div>
                //   <div>{entry.time}</div>
                // </div>
                 <tr>
                 <td className="px-2 py-1 gap-1 flex flex-row">
                  <span>{entry.callId}</span>
                  <span className="font-mono text-gray-600">{prettyMilliseconds(entry.pmillis || 0)}</span>
                  </td>
                 <td className="px-2 py-1">{typeof entry.result == "string" ? entry.result : JSON.stringify(entry.result) || '-'}</td>
                 <td className="px-2 py-1">{moment(entry.time).format('YYYY-MM-DD HH:mm:ss')}</td>
                 </tr>
              );
            })}
             
            </tbody>
          </table>

          </div>
        
          
        </div>
      </div>
    </main>
  );
}
