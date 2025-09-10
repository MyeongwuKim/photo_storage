import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const videoSamples = [
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
];

// ✅ 태그 후보 12개
const tagBodies = [
  "여행",
  "음식",
  "풍경",
  "일상",
  "작업",
  "취미",
  "사진",
  "영상",
  "도시",
  "자연",
  "친구",
  "가족",
];

function getRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  console.log("🌱 Seeding demo data...");

  // ✅ 태그 12개 미리 생성
  const tags = await Promise.all(
    tagBodies.map((body) => prisma.tag.create({ data: { body } }))
  );

  // ✅ Post 30개 생성
  for (let i = 0; i < 30; i++) {
    // 1~3개의 태그 랜덤 연결
    const pickedTags = Array.from(
      { length: 1 + Math.floor(Math.random() * 3) },
      () => getRandom(tags)
    );

    const post = await prisma.post.create({
      data: {
        comment: `Demo post #${i}`,
        place: `Random place ${i}`,
        shootingDate: new Date(
          Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 365)
        ),
        score: Math.floor(Math.random() * 6),
        map: {
          lat: 37.5 + Math.random() * 0.1,
          lng: 127 + Math.random() * 0.1,
          placeAddress: `Seoul random address ${i}`,
        },
        tags: {
          connect: pickedTags.map((t) => ({ id: t.id })),
        },
      },
    });

    // 파일 개수 랜덤 (2~4개)
    const fileCount = 2 + Math.floor(Math.random() * 3);

    for (let j = 0; j < fileCount; j++) {
      const isVideo = Math.random() > 0.5; // 이미지/비디오 반반
      if (isVideo) {
        const videoUrl = getRandom(videoSamples);
        await prisma.file.create({
          data: {
            fileId: videoUrl,
            type: "video",
            duration: 60, // ✅ 항상 1분으로 고정
            width: 1920,
            height: 1080,
            thumbnail: `https://picsum.photos/seed/video-${i}-${j}/400/300`,
            postId: post.id,
            createdAt: new Date(),
          },
        });
      } else {
        const width = 1200;
        const height = 800;
        await prisma.file.create({
          data: {
            fileId: `https://picsum.photos/seed/image-${i}-${j}/${width}/${height}`,
            type: "image",
            width,
            height,
            thumbnail: `https://picsum.photos/seed/image-${i}-${j}/400/300`,
            postId: post.id,
            createdAt: new Date(),
          },
        });
      }
    }
  }

  console.log("✅ Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
