import { prisma } from "./db_connection.ts"

export default async function closer() {
    const now = new Date()

    const startOfToday = new Date(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    );

    const keys = await prisma.visitors.findMany({
        select: {
            key: true
        },
        where: {
            date: {
                lt: startOfToday
            }
        }
    });

    let keysToFree = keys.filter(k => k.key != null);

    await prisma.keys.updateMany({
        where: {
            key: { in: keysToFree.map(k => k.key as string) }
        },
        data: {
            isFree: true
        }
    });

    await prisma.visitors.updateMany({
        where: {
            date: {
                lt: startOfToday
            }
        },
        data: {
            status: 2
        }
    });
}