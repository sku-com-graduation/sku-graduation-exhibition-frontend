import styled from "styled-components";

const Container = styled.div`
  width: 100%;
  min-height: 100vh;
  background-color: #f1f1f1;
  font-family: "Helvetica Neue", sans-serif;
  color: #333;
  display: grid;
  grid-template-rows: auto 1fr auto;
`;

const HeroSection = styled.section`
  width: 100%;
  height: 100vh;
  background: url("https://source.unsplash.com/random/1600x900") no-repeat center center/cover;
  display: grid;
  justify-items: center;
  align-items: center;
  color: white;
  text-align: center;
  position: relative;
`;

const HeroTitle = styled.h1`
  font-size: 4rem;
  font-weight: bold;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
`;

const HeroSubtitle = styled.p`
  font-size: 1.5rem;
  margin: 20px 0;
  font-weight: 300;
  opacity: 0.8;
`;

const Button = styled.button`
  background-color: #ff5c5c;
  color: white;
  font-size: 1rem;
  padding: 12px 30px;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #e04b4b;
  }
`;

const Section = styled.section`
  padding: 4rem 2rem;
  background-color: #ffffff;
  display: grid;
  justify-items: center;
  align-items: center;
  text-align: center;
`;

const SectionTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
`;

const SectionDescription = styled.p`
  font-size: 1.2rem;
  margin: 0 auto;
  width: 80%;
  max-width: 900px;
  color: #666;
`;

const Gallery = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  padding-top: 3rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const GalleryItem = styled.div`
  position: relative;
  overflow: hidden;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const GalleryImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.1);
  }
`;

const YearHomePage = () => {
  return (
    <Container>
      {/* Hero Section */}
      <HeroSection>
        <div>
          <HeroTitle>WHERE IDEAS BECOME REALITY</HeroTitle>
          <HeroSubtitle>Discover the latest creative works of the year</HeroSubtitle>
          <Button>Explore Now</Button>
        </div>
      </HeroSection>

      {/* About the Exhibition Section */}
      <Section>
        <div>
          <SectionTitle>About the Exhibition</SectionTitle>
          <SectionDescription>
            Our annual exhibition showcases a diverse range of artwork, including digital art, installations, and interactive experiences. Explore the
            creativity that pushes boundaries.
          </SectionDescription>
        </div>
      </Section>

      {/* Gallery Section */}
      <Section>
        <div>
          <SectionTitle>Gallery</SectionTitle>
          <Gallery>
            <GalleryItem>
              <GalleryImage src="https://source.unsplash.com/random/1600x1600" alt="Exhibition Piece" />
            </GalleryItem>
            <GalleryItem>
              <GalleryImage src="https://source.unsplash.com/random/1600x1600" alt="Exhibition Piece" />
            </GalleryItem>
            <GalleryItem>
              <GalleryImage src="https://source.unsplash.com/random/1600x1600" alt="Exhibition Piece" />
            </GalleryItem>
          </Gallery>
        </div>
      </Section>
    </Container>
  );
};

export default YearHomePage;
