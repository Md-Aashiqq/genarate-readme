const GithubList = ({ items } : any) => {
  return (
    <ul className={"github-list"}>
      {items.map((item:any, index:number) => (
        <li key={index} className={"github-list__item"}>
          {item.icon && (
            <div className={"github-list__icon"}>
              <item.icon />
            </div>
          )}
          <div className={"github-list__content"}>{item.content}</div>
        </li>
      ))}
    </ul>
  );
};

export default GithubList;
