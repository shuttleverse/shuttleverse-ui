import { useNavigate } from "react-router-dom";
import EntityListing from "../components/shared/entity-listing";
import { useClubs } from "@/services/clubs";

const Clubs = () => {
  const navigate = useNavigate();

  const handleAddClub = () => {
    navigate("/clubs/add");
  };

  return (
    <EntityListing
      entityType="club"
      title="Badminton Clubs"
      useEntityData={useClubs}
      onAddEntity={handleAddClub}
    />
  );
};

export default Clubs;
