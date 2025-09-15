import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { entityColors } from "@/lib/colors";
import BottomNavigation from "@/components/layout/bottom-navigation";
import { useIsMobile } from "@/hooks/use-mobile";

const AddPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const entityTypes = [
    {
      key: "court",
      title: "Court",
      description: "Add a badminton court or facility",
      color: "#059669",
      features: ["Location", "Operating hours", "Pricing"],
    },
    {
      key: "coach",
      title: "Coach",
      description: "Add a badminton coach or trainer",
      color: "#2563eb",
      features: ["Contact", "Location", "Rates"],
    },
    {
      key: "stringer",
      title: "Stringer",
      description: "Add a racket stringing service",
      color: "#d97706",
      features: ["Contact", "Location", "Pricing", "String types"],
    },
  ];

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
  };

  const handleContinue = () => {
    if (selectedType === "coach") {
      navigate(`/coaches/add`);
    } else {
      navigate(`/${selectedType}s/add`);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 via-blue-100 to-green-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/30 backdrop-blur-md border border-gray-200 shadow-md">
          <CardHeader className="text-center">
            <CardTitle>Sign in to Add</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600 text-center">
              You need to be signed in to add courts, coaches, or stringers to
              the community.
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => navigate(-1)}
                className="flex-1"
              >
                Go Back
              </Button>
              <Button onClick={() => navigate("/login")} className="flex-1">
                Sign In
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-100 via-blue-100 to-green-100">
        <div className="bg-white/60 backdrop-blur-md border-b border-white/20">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {selectedType
                    ? `Add ${
                        selectedType.charAt(0).toUpperCase() +
                        selectedType.slice(1)
                      }`
                    : "What would you like to add?"}
                </h1>
                <p className="text-sm text-gray-600">
                  {selectedType
                    ? "Help others discover your service"
                    : "Choose what you'd like to add to the community"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          {!selectedType ? (
            <div className="space-y-4">
              {entityTypes.map((type) => (
                <Card
                  key={type.key}
                  className={`cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] border-2 bg-white/40 backdrop-blur-md border-gray-200 shaddow-md ${
                    selectedType === type.key ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => handleTypeSelect(type.key)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <Badge
                            variant="secondary"
                            className="text-sm font-semibold px-4 py-2"
                            style={{
                              background:
                                entityColors[
                                  type.key as keyof typeof entityColors
                                ]?.gradient || entityColors.default.gradient,
                              color: "white",
                              borderColor: "transparent",
                            }}
                          >
                            {type.title}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-3">{type.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {type.features.map((feature, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs"
                            >
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              <Card className="bg-white/60 backdrop-blur-md border border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <Badge
                          variant="secondary"
                          className="text-base font-semibold px-4 py-2"
                          style={{
                            background:
                              entityColors[
                                selectedType as keyof typeof entityColors
                              ]?.gradient || entityColors.default.gradient,
                            color: "white",
                            borderColor: "transparent",
                          }}
                        >
                          {
                            entityTypes.find((t) => t.key === selectedType)
                              ?.title
                          }
                        </Badge>
                      </div>
                      <p className="text-gray-600">
                        {
                          entityTypes.find((t) => t.key === selectedType)
                            ?.description
                        }
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900">
                      What you'll need:
                    </h3>
                    <ul className="space-y-2">
                      {entityTypes
                        .find((t) => t.key === selectedType)
                        ?.features.map((feature, index) => (
                          <li
                            key={index}
                            className="flex items-center gap-2 text-gray-600"
                          >
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                            {feature}
                          </li>
                        ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setSelectedType(null)}
                  className="flex-1"
                >
                  Choose Different Type
                </Button>
                <Button onClick={handleContinue} className="flex-1">
                  Continue
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      {isMobile && <BottomNavigation />}
    </>
  );
};

export default AddPage;
