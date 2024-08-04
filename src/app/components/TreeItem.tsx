import classNames from "classnames";
import prettyBytes from "pretty-bytes";

interface Props<T> {
  readonly name: string;
  readonly onClick?: (data: string) => void;
  readonly path?: string;
  readonly isActive?: boolean;
  readonly size?: number;
}

export default function TreeItem({
  name,
  onClick,
  path,
  isActive,
  size,
}: Props<any>) {
  return (
    <div
      className={classNames(
        "bg-white rounded transition-colors hover:bg-gray-100 px-2 py-1.5 text-xs cursor-pointer flex flex-row gap-2 justify-between items-center",
        { "bg-gray-200 hover:bg-gray-300": isActive == true }
      )}
      onClick={() => {
        if (onClick && path) {
          onClick(path);
          return;
        }

        if (!onClick) {
          throw new Error("onClick is not defined");
        }

        if (!path) {
          throw new Error("path is not defined");
        }
      }}
    >
      <div className="flex flex-row items-center gap-2">
        <svg
          viewBox="0 0 32 32"
          fill="currentColor"
          height="1em"
          width="1em"
          className="text-black size-4"
        >
          <path
            fill="currentColor"
            d="M9.633 7.968h3.751v10.514c0 4.738-2.271 6.392-5.899 6.392-.888 0-2.024-.148-2.764-.395l.42-3.036a6.18 6.18 0 001.925.296c1.58 0 2.567-.716 2.567-3.282V7.968zm7.008 12.785c.987.518 2.567 1.037 4.171 1.037 1.728 0 2.641-.716 2.641-1.826 0-1.012-.79-1.629-2.789-2.32-2.764-.987-4.59-2.517-4.59-4.961 0-2.838 2.394-4.985 6.293-4.985 1.9 0 3.258.37 4.245.839l-.839 3.011a7.779 7.779 0 00-3.455-.79c-1.629 0-2.419.765-2.419 1.604 0 1.061.913 1.53 3.085 2.369 2.937 1.086 4.294 2.616 4.294 4.985 0 2.789-2.122 5.158-6.688 5.158-1.9 0-3.776-.518-4.714-1.037l.765-3.085z"
          />
        </svg>
        <span>{name}</span>
      </div>
      
      <span className="text-gray-400 text-[10px] font-mono">
        {prettyBytes(size || 0)}
      </span>
    </div>
  );
}
