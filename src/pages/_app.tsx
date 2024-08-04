import "@/app/globals.css";
import { AppProps } from "next/app";
import { QueryClient, QueryClientProvider } from "react-query";

const queryClient = new QueryClient();


/**
 * The root component of the Next.js application.
 * This component is responsible for setting up the global providers and
 * rendering the page component.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {React.ComponentType} props.Component - The page component to render.
 * @param {Object} props.pageProps - The properties passed to the page component.
 * @return {JSX.Element} The rendered root component.
 */
export default function MyApp({ Component, pageProps } : AppProps ) {
    // Use the layout defined at the page level, if available
    // const getLayout = Component.getLayout ?? ((page) => page)
    
    /**
     * The root component of the Next.js application.
     *
     * @return {JSX.Element} The rendered root component.
     */
    return (
        <div>
            {/* The QueryClientProvider sets up the global QueryClient for React Query. */}
            <QueryClientProvider client={queryClient}>
                {/* Render the page component with the page properties. */}
                <Component {...pageProps} />
            </QueryClientProvider>
        </div>
    );
}
