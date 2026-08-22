'use server';

import { prisma } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";
import { RoomStatus } from "@prisma/client";

export async function updateRoomStatus(roomId: string, status: RoomStatus) {
  await prisma.room.update({
    where: { id: roomId },
    data: { status }
  });
  
  revalidatePath('/admin/housekeeping');
}
