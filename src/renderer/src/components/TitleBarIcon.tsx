export function TitleBarIcon(): React.JSX.Element {
  return (
    <img
      className="title-bar-icon"
      src={`${import.meta.env.BASE_URL}favicon-16.png`}
      alt="TPS Report Wizard icon"
    />
  )
}
