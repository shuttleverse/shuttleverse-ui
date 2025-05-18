import { useNavigate } from "react-router-dom";
import EntityListing from "../components/shared/entity-listing";
import { useCoaches } from "@/services/coaches";

const Coaches = () => {
  const navigate = useNavigate();

  const handleAddCoach = () => {
    navigate("/coaches/add");
  };

  return (
    <EntityListing
      entityType="coach"
      title="Badminton Coaches"
      useEntityData={useCoaches}
      onAddEntity={handleAddCoach}
    />
  );
};

export default Coaches;
