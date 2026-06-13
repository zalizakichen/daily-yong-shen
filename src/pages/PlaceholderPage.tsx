type Props = {
  text: string;
};

export default function PlaceholderPage({ text }: Props) {
  return (
    <div className="page placeholder-page">
      <p className="placeholder-text">{text}</p>
    </div>
  );
}
