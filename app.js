const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();

app.use(express.json());

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;
  const highRiskWords = ["自杀", "伤害自己", "不想活"];
  const isHighRisk = highRiskWords.some((Work) => {
    return userMessage.includes(Work);
  });
  if (isHighRisk) {
    return res.json({
      reply:
        "我很担心你现在的安全。如果你有立即伤害自己的冲动，请马上联系身边可信任的人，或拨打当地紧急电话。你不是一个人。",
      riskLevel: "high",
    });
  }
  try {
    const response = await axios.post(
      "https://api.deepseek.com/chat/completions",
      {
        model: "deepseek-v4-flash",

        messages: [
          {
            role: "system",
            content:
              "你是一个温柔、耐心、积极倾听的心理陪伴助手。用户可能有压力、焦虑、失落等情绪。你不能提供医疗建议，但可以安慰和引导用户，如果出现自伤或危险行为词汇，要提醒用户寻求专业帮助。",
          },
          {
            role: "user",
            content: userMessage,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        },
      },
    );
    const aiReply = response.data.choices[0].message.content;

    res.json({
      reply: aiReply,
    });
  } catch (error) {
    console.log("ai调用失败: ");

    if (error.response) {
      console.log("状态码", error.response.status);
      console.log("返回数据", error.response.data);
    } else {
      console.log("错误信息", error.message);
    }
    res.status(500).json({
      error: "ai调用失败",
    });
  }
});
app.listen(3000, () => {
  console.log("服务器启动成功");
});
