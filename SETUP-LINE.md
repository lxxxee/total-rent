# ตั้งค่า LINE ให้พร้อมใช้งาน

ตัวระบบเตรียมไว้แล้ว เหลือการเชื่อมบัญชีของเจ้าของเท่านั้น เพราะ LINE ไม่อนุญาตให้ผู้อื่นสมัครหรือออก Token แทนเจ้าของบัญชี

## ข้อมูลที่ต้องขอจากพี่

1. เข้า [LINE Developers Console](https://developers.line.biz/console/) ด้วยบัญชี LINE ของพี่
2. สร้าง Provider ชื่อ `Total Rent`
3. สร้าง Messaging API channel ชื่อ `Total Rent Bot`
4. ส่งค่า **Channel ID** มาได้ (ไม่ใช่ข้อมูลลับ)
5. นำ **Channel secret** และ **Channel access token** ใส่ใน Environment Variables ของ Vercel โดยตรง ห้ามส่งในแชตหรือบันทึกลง GitHub

## เปิดใช้งานบน Vercel

1. เข้า [Vercel](https://vercel.com/new) และเลือก GitHub repository นี้
2. กด Deploy โดยไม่ต้องเปลี่ยน Build settings
3. ไปที่ Settings → Environment Variables แล้วเพิ่ม `LINE_CHANNEL_SECRET` และ `LINE_CHANNEL_ACCESS_TOKEN`
4. กลับไป LINE Developers → Messaging API → Webhook settings
5. ใส่ `https://ชื่อโปรเจกต์.vercel.app/api/webhook` แล้วกด Verify และเปิด **Use webhook**
6. ปิด **Auto-reply messages** ใน LINE Official Account Manager เพื่อไม่ให้ตอบซ้ำ
7. เพิ่มบอตเป็นเพื่อนและพิมพ์ `เมนู`

คำสั่งที่รองรับ: `เมนู`, `สรุป`, `ล่าสุด`, `ทะเบียน VHH7933` และ `เว็บ`

## จำกัดให้พี่ใช้คนเดียว (แนะนำ)

หลังส่งข้อความครั้งแรก ดู `source.userId` ใน Vercel Function Logs แล้วเพิ่มเป็น `LINE_ALLOWED_USER_IDS` หากมีหลายบัญชีให้คั่นด้วย comma จากนั้น Redeploy

## เชื่อม MCP กับโปรแกรม AI

เพิ่ม server นี้ในไฟล์ตั้งค่า MCP ของโปรแกรม โดยใช้ path จริงของ repository:

```json
{
  "mcpServers": {
    "total-rent": {
      "command": "node",
      "args": ["/absolute/path/to/total-rent/mcp/server.js"]
    }
  }
}
```

เครื่องมือ MCP ที่มีคือ `list_rentals` และ `find_rental` โดยอ่านจาก `data/rentals.json` โดยตรง
