import { useNavigate } from "react-router-dom";
import EntityListing from "../components/shared/entity-listing";
import { useStringers } from "@/services/stringers";

const Stringers = () => {
  const navigate = useNavigate();

  const handleAddStringer = () => {
    navigate("/stringers/add");
  };

  return (
    <EntityListing
      entityType="stringer"
      title="Badminton Stringers"
      useEntityData={useStringers}
      onAddEntity={handleAddStringer}
    />
  );
};

export default Stringers;
