import Layout from "@/components/layout/layout";

const About = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              About Shuttleverse
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Connecting badminton enthusiasts with courts, coaches, and
              stringers in the U.S.
            </p>
          </div>

          <div className="bg-emerald-50/80 backdrop-blur-md rounded-xl p-10 border border-emerald-200/60 shadow-lg mb-12">
            <h2 className="text-3xl font-semibold text-emerald-800 mb-6">
              About Me
            </h2>
            <div className="space-y-6">
              <p className="text-gray-700 leading-relaxed text-lg">
                Hi, I'm Qihong, a Computer Science student at Northeastern
                University who is passionate about badminton. I created
                Shuttleverse to bridge the gap between players and the
                facilities, coaches, and services they need.
              </p>
              <p className="text-gray-700 leading-relaxed text-lg">
                Badminton, though often overlooked in favor of more mainstream
                sports, has a dedicated community that deserves better access to
                resources. This platform is my way of giving back to the sport I
                love while combining my technical skills with my passion for
                badminton to create something meaningful for the community.
              </p>
            </div>
          </div>

          <div className="bg-cyan-50/80 backdrop-blur-md rounded-xl p-10 border border-cyan-200/60 shadow-lg mb-12">
            <h2 className="text-3xl font-semibold text-cyan-800 mb-6">
              Our Mission
            </h2>
            <div className="space-y-6">
              <p className="text-gray-700 leading-relaxed text-lg">
                Shuttleverse is dedicated to building the ultimate badminton
                community platform. We believe that every player, from beginners
                to professionals, deserves easy access to quality facilities,
                expert coaching, and professional stringing services.
              </p>
              <p className="text-gray-700 leading-relaxed text-lg">
                Our platform connects badminton enthusiasts with the resources
                they need to improve their game, find playing partners, and
                become part of a thriving community.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-emerald-50/80 backdrop-blur-sm rounded-xl p-8 border border-emerald-200/60 shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-2xl font-semibold text-emerald-800 mb-4">
                Find Courts
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Discover badminton courts near you with detailed information
                about facilities, pricing, and availability. Book your next game
                with ease.
              </p>
            </div>
            <div className="bg-emerald-50/80 backdrop-blur-sm rounded-xl p-8 border border-teal-200/60 shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-2xl font-semibold text-emerald-800 mb-4">
                Connect with Coaches
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Find qualified badminton coaches in your area. View their
                experience, specializations, and schedule lessons to improve
                your skills.
              </p>
            </div>
            <div className="bg-emerald-50/80 backdrop-blur-sm rounded-xl p-8 border border-cyan-200/60 shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-2xl font-semibold text-emerald-800 mb-4 ">
                Professional Stringing
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Locate professional stringers who can provide quality racket
                stringing services. Get your equipment ready for peak
                performance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default About;
