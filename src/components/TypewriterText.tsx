type Props = {
  text: string;
  className?: string;
};

export default function TypewriterText({
  text,
  className = "typewriter-title",
}: Props) {
  return <p className={className}>{text}</p>;
}
