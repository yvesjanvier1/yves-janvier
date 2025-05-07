
interface ProjectGalleryProps {
  images?: string[];
}

const ProjectGallery = ({ images }: ProjectGalleryProps) => {
  if (!images || images.length === 0) {
    return null;
  }
  
  return (
    <div className="mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {images.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`Project image ${index + 1}`}
            className="rounded-md object-cover w-full"
            style={{ maxHeight: "400px" }}
          />
        ))}
      </div>
    </div>
  );
};

export default ProjectGallery;
