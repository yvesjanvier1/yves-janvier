
interface ProjectContentProps {
  description: string;
}

const ProjectContent = ({ description }: ProjectContentProps) => (
  <div className="prose dark:prose-invert max-w-none">
    {description.split('\n').map((paragraph, index) => (
      <p key={index}>{paragraph}</p>
    ))}
  </div>
);

export default ProjectContent;
