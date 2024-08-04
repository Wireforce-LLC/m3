/**
 * Renders a tree node with the given data and name.
 *
 * @param {Object} props - The props for the TreeNode component.
 * @param {any} props.data - The data to be rendered in the tree node.
 * @param {string} [props.name=''] - The name of the tree node.
 * @returns {JSX.Element} The rendered tree node.
 */
const TreeNode = ({ data, name = '', count=0 }: { data: any, name?: string, count: number }): JSX.Element => {
  return (
    <div style={{ paddingLeft: 10 }}>
      <span className="font-bold">{name}</span>
      {typeof data === 'object' && data !== null
        ? Object.keys(data).map((key: string) => (
          <TreeNode key={key} name={key} data={data[key]} count={count + 1} />
        ))
        : Value({ value: data })}
    </div>
  );
};
  
const Value = ({ value }: { value: any }) => {
    let color;
    
    // Определение цвета в зависимости от типа данных
    if (typeof value === 'number') {
      color = 'blue';
    } else if (typeof value === 'string') {
      color = 'green';
    } else if (typeof value === 'boolean') {
      color = 'red';
    } else if (value === null) {
      color = 'grey';
    } else {
      color = 'black';
    }
  
    return (
      <span style={{ color }} className="font-mono">
        : {String(value)}
      </span>
    );
  };

  
/**
 * Renders a tree view with the given data.
 *
 * @param {Object} props - The props for the Tree component.
 * @param {any} props.data - The data to be rendered in the tree view.
 * @returns {JSX.Element} The rendered tree view.
 */
const Tree = ({ data }: { data: any }): JSX.Element => {
  return (
    <div>
      <TreeNode data={data} count={0} />
    </div>
  );
};


export default function DependencyInspector({conf} : {conf: any}) {
    return (
        <div className="text-[10px]">
            <Tree data={conf} />
        </div>
    );
}
  