import { useNavigate } from "react-router-dom";
import EntityListing from "../components/shared/entity-listing";
import { useCourts } from "@/services/courts";

const Courts = () => {
  const navigate = useNavigate();

  const handleAddCourt = () => {
    navigate("/courts/add");
  };

  return (
    <EntityListing
      entityType="court"
      title="Courts"
      useEntityData={useCourts}
      onAddEntity={handleAddCourt}
    />
  );
};

export default Courts;
