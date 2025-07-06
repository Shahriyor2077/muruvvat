import { BotService } from "./bot.service";
import { Action, Ctx, On, Start, Update } from "nestjs-telegraf";
import { Context, Markup } from "telegraf";
import { Bot } from "./models/bot.model";

@Update()
export class BotUpdate {
  constructor(private readonly botService: BotService) {}
  @Start()
  async onStart(@Ctx() ctx: Context) {
    try {
      const user_id = ctx.from?.id;
      const user = await this.botService.getUserById(String(user_id));

      if (!user) {
        await this.botService.createUser({
          user_id: String(ctx.from?.id)!,
          first_name: ctx.from?.first_name,
          last_name: ctx.from?.last_name,
          last_state: "role",
        });

        ctx.reply("Qaysi ro'ldan ro'yxatdan o'tmoqchisiz?", {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "Sahiy",
                  callback_data: `sahiy__${user_id}`,
                },
                {
                  text: "Sabrli",
                  callback_data: `sabrli__${user_id}`,
                },
              ],
            ],
          },
        });
      } else {
        if (user.role && user.name && user.phone_number) {
          ctx.reply(
            `✅ Siz allaqachon ro'yxatdan o'tgansiz!\n\n👤 Ism: ${user.name}\n📱 Telefon: ${user.phone_number}\n🎭 Rol: ${user.role === "sahiy" ? "Sahiy" : "Sabrli"}`,
            {
              reply_markup: {
                keyboard: [
                  ["Ma'lumotlarni ko'rish"],
                  ["Ma'lumotlarni o'zgartirish"],
                  ["Yordam"],
                ],
                resize_keyboard: true,
              },
            }
          );
        } else {
          ctx.reply("Qaysi ro'ldan ro'yxatdan o'tmoqchisiz?", {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "Sahiy",
                    callback_data: `sahiy__${user_id}`,
                  },
                  {
                    text: "Sabrli",
                    callback_data: `sabrli__${user_id}`,
                  },
                ],
              ],
            },
          });
        }
      }
    } catch (error) {
      console.log("Error on Start", error);
    }
  }

  @Action(/^sahiy__+\d+/)
  async onClickSahiy(@Ctx() ctx: Context) {
    try {
      const callbackData = ctx.callbackQuery!["data"];
      const user_id = callbackData.split("__")[1];

      const user = await this.botService.getUserById(String(user_id));
      if (!user) {
        await ctx.reply("Siz hali ro'yxatdan o'tmagansiz", {
          parse_mode: "HTML",
          ...Markup.keyboard(["/start"]).resize().oneTime(),
        });
      } else {
        await this.botService.updateUserRole(String(user_id), "sahiy");
        await this.botService.updateUserState(String(user_id), "name");

        await ctx.answerCbQuery("Sahiy ro'li tanlandi! ✅");

        ctx.reply("🎭 Sahiy ro'li tanlandi!\n\nIsmingizni kiriting:");
      }
    } catch (error) {
      console.log("Error on Click Sahiy", error);
    }
  }

  @Action(/^sabrli__+\d+/)
  async onClickSabrli(@Ctx() ctx: Context) {
    try {
      const callbackData = ctx.callbackQuery!["data"];
      const user_id = callbackData.split("__")[1];

      const user = await this.botService.getUserById(String(user_id));
      if (!user) {
        await ctx.reply("Siz hali ro'yxatdan o'tmagansiz", {
          parse_mode: "HTML",
          ...Markup.keyboard(["/start"]).resize().oneTime(),
        });
      } else {
        await this.botService.updateUserRole(String(user_id), "sabrli");
        await this.botService.updateUserState(String(user_id), "name");

        await ctx.answerCbQuery("Sabrli ro'li tanlandi! ✅");

        ctx.reply("🎭 Sabrli ro'li tanlandi!\n\nIsmingizni kiriting:");
      }
    } catch (error) {
      console.log("Error on Click Sabrli", error);
    }
  }

  @On("text")
  async onText(@Ctx() ctx: Context) {
    try {
      const user_id = ctx.from?.id;
      const user = await this.botService.getUserById(String(user_id));
      if (!user) {
        await ctx.reply("Siz hali ro'yxatdan o'tmagansiz", {
          parse_mode: "HTML",
          ...Markup.keyboard(["/start"]).resize().oneTime(),
        });
      } else {
        if (user && user.last_state == "name") {
          if ("text" in ctx.msg) {
            await this.botService.updateUserName(String(user_id), ctx.msg.text);
            await this.botService.updateUserState(
              String(user_id),
              "phone_number"
            );

            ctx.reply("📱 Telefon raqamingizni yuboring", {
              ...Markup.keyboard([
                Markup.button.contactRequest("📞 Contactni ulashish"),
              ]).resize(),
            });
          }
        } else if (user && user.last_state == "location") {
          if ("text" in ctx.msg) {
            if (ctx.msg.text === "O'tkazib yuborish") {
              await this.botService.updateUserState(
                String(user_id),
                "completed"
              );

              ctx.reply(
                `✅ Siz muvaffaqiyatli ro'yxatdan o'tdingiz!\n\n👤 Ism: ${user.name}\n📱 Telefon: ${user.phone_number}\n🎭 Rol: ${user.role === "sahiy" ? "Sahiy" : "Sabrli"}\n📍 Manzil: Ko'rsatilmagan`,
                {
                  reply_markup: {
                    keyboard: [
                      ["Ma'lumotlarni ko'rish"],
                      ["Ma'lumotlarni o'zgartirish"],
                      ["Yordam"],
                    ],
                    resize_keyboard: true,
                  },
                }
              );
            } else {
              await this.botService.updateUserState(
                String(user_id),
                "completed"
              );

              ctx.reply(
                `✅ Siz muvaffaqiyatli ro'yxatdan o'tdingiz!\n\n👤 Ism: ${user.name}\n📱 Telefon: ${user.phone_number}\n🎭 Rol: ${user.role === "sahiy" ? "Sahiy" : "Sabrli"}\n📍 Manzil: ${ctx.msg.text}`,
                {
                  reply_markup: {
                    keyboard: [
                      ["Ma'lumotlarni ko'rish"],
                      ["Ma'lumotlarni o'zgartirish"],
                      ["Yordam"],
                    ],
                    resize_keyboard: true,
                  },
                }
              );
            }
          }
        } else if (user && user.last_state == "edit_name") {
          if ("text" in ctx.msg) {
            await this.botService.updateUserName(String(user_id), ctx.msg.text);
            await this.botService.updateUserState(String(user_id), "completed");

            ctx.reply(
              `✅ Ismingiz muvaffaqiyatli o'zgartirildi!\n\n👤 Yangi ism: ${ctx.msg.text}`,
              {
                reply_markup: {
                  keyboard: [
                    ["Ma'lumotlarni ko'rish"],
                    ["Ma'lumotlarni o'zgartirish"],
                    ["Yordam"],
                  ],
                  resize_keyboard: true,
                },
              }
            );
          }
        } else if (user && user.last_state == "edit_location") {
          if ("text" in ctx.msg) {
            await this.botService.updateUserState(String(user_id), "completed");

            ctx.reply(
              `✅ Manzilingiz muvaffaqiyatli o'zgartirildi!\n\n📍 Yangi manzil: ${ctx.msg.text}`,
              {
                reply_markup: {
                  keyboard: [
                    ["Ma'lumotlarni ko'rish"],
                    ["Ma'lumotlarni o'zgartirish"],
                    ["Yordam"],
                  ],
                  resize_keyboard: true,
                },
              }
            );
          }
        } else if (user && user.last_state == "completed") {
          if ("text" in ctx.msg) {
            if (ctx.msg.text === "Ma'lumotlarni ko'rish") {
              ctx.reply(
                `📋 Sizning ma'lumotlaringiz:\n\n👤 Ism: ${user.name}\n📱 Telefon: ${user.phone_number}\n🎭 Rol: ${user.role === "sahiy" ? "Sahiy" : "Sabrli"}\n📍 Manzil: ${user.last_state === "completed" ? "Ko'rsatilmagan" : "Mavjud"}`,
                {
                  reply_markup: {
                    keyboard: [
                      ["Ma'lumotlarni ko'rish"],
                      ["Ma'lumotlarni o'zgartirish"],
                      ["Yordam"],
                    ],
                    resize_keyboard: true,
                  },
                }
              );
            } else if (ctx.msg.text === "Ma'lumotlarni o'zgartirish") {
              ctx.reply("Qaysi ma'lumotni o'zgartirmoqchisiz?", {
                reply_markup: {
                  inline_keyboard: [
                    [
                      {
                        text: "👤 Ism",
                        callback_data: `edit_name__${user_id}`,
                      },
                    ],
                    [
                      {
                        text: "📱 Telefon raqam",
                        callback_data: `edit_phone__${user_id}`,
                      },
                    ],
                    [
                      {
                        text: "📍 Manzil",
                        callback_data: `edit_location__${user_id}`,
                      },
                    ],
                    [
                      {
                        text: "🎭 Rol",
                        callback_data: `edit_role__${user_id}`,
                      },
                    ],
                  ],
                },
              });
            } else if (ctx.msg.text === "Yordam") {
              ctx.reply(
                "🤖 Bu bot muruvvat (sahiy va sabrli) odamlarni ro'yxatdan o'tkazish uchun yaratilgan.\n\n📞 Savollaringiz bo'lsa, admin bilan bog'laning.",
                {
                  reply_markup: {
                    keyboard: [
                      ["Ma'lumotlarni ko'rish"],
                      ["Ma'lumotlarni o'zgartirish"],
                      ["Yordam"],
                    ],
                    resize_keyboard: true,
                  },
                }
              );
            }
          }
        }
      }
    } catch (error) {
      console.log("Error on Text", error);
    }
  }

  @On("contact")
  async onContact(@Ctx() ctx: Context) {
    try {
      const user_id = ctx.from?.id;
      const user = await this.botService.getUserById(String(user_id));
      if (!user) {
        await ctx.reply("Siz hali ro'yxatdan o'tmagansiz", {
          parse_mode: "HTML",
          ...Markup.keyboard(["/start"]).resize().oneTime(),
        });
      } else {
        if (user && user.last_state == "phone_number") {
          if ("contact" in ctx.msg) {
            await this.botService.updateUserPhone(
              String(user_id),
              ctx.msg.contact.phone_number
            );
            await this.botService.updateUserState(String(user_id), "location");

            ctx.reply(
              "📍 Manzilingizni kiriting: ",
              Markup.keyboard(["O'tkazib yuborish"]).resize()
            );
          }
        } else if (user && user.last_state == "edit_phone") {
          if ("contact" in ctx.msg) {
            await this.botService.updateUserPhone(
              String(user_id),
              ctx.msg.contact.phone_number
            );
            await this.botService.updateUserState(String(user_id), "completed");

            ctx.reply(
              `✅ Telefon raqamingiz muvaffaqiyatli o'zgartirildi!\n\n📱 Yangi telefon: ${ctx.msg.contact.phone_number}`,
              {
                reply_markup: {
                  keyboard: [
                    ["Ma'lumotlarni ko'rish"],
                    ["Ma'lumotlarni o'zgartirish"],
                    ["Yordam"],
                  ],
                  resize_keyboard: true,
                },
              }
            );
          }
        }
      }
    } catch (error) {
      console.log("Error on Contact", error);
    }
  }

  @Action(/^edit_name__+\d+/)
  async onEditName(@Ctx() ctx: Context) {
    try {
      const callbackData = ctx.callbackQuery!["data"];
      const user_id = callbackData.split("__")[1];

      const user = await this.botService.getUserById(String(user_id));
      if (!user) {
        await ctx.reply("Siz hali ro'yxatdan o'tmagansiz");
      } else {
        await this.botService.updateUserState(String(user_id), "edit_name");

        await ctx.answerCbQuery("Ismni o'zgartirish tanlandi! ✏️");

        ctx.reply("✏️ Yangi ismingizni kiriting:");
      }
    } catch (error) {
      console.log("Error on Edit Name", error);
    }
  }

  @Action(/^edit_phone__+\d+/)
  async onEditPhone(@Ctx() ctx: Context) {
    try {
      const callbackData = ctx.callbackQuery!["data"];
      const user_id = callbackData.split("__")[1];

      const user = await this.botService.getUserById(String(user_id));
      if (!user) {
        await ctx.reply("Siz hali ro'yxatdan o'tmagansiz");
      } else {
        await this.botService.updateUserState(String(user_id), "edit_phone");

        await ctx.answerCbQuery("Telefon raqamni o'zgartirish tanlandi! 📱");

        ctx.reply("📱 Yangi telefon raqamingizni yuboring:", {
          ...Markup.keyboard([
            Markup.button.contactRequest("📞 Contactni ulashish"),
          ]).resize(),
        });
      }
    } catch (error) {
      console.log("Error on Edit Phone", error);
    }
  }

  @Action(/^edit_location__+\d+/)
  async onEditLocation(@Ctx() ctx: Context) {
    try {
      const callbackData = ctx.callbackQuery!["data"];
      const user_id = callbackData.split("__")[1];

      const user = await this.botService.getUserById(String(user_id));
      if (!user) {
        await ctx.reply("Siz hali ro'yxatdan o'tmagansiz");
      } else {
        await this.botService.updateUserState(String(user_id), "edit_location");

        await ctx.answerCbQuery("Manzilni o'zgartirish tanlandi! 📍");

        ctx.reply("📍 Yangi manzilingizni kiriting:");
      }
    } catch (error) {
      console.log("Error on Edit Location", error);
    }
  }

  @Action(/^edit_role__+\d+/)
  async onEditRole(@Ctx() ctx: Context) {
    try {
      const callbackData = ctx.callbackQuery!["data"];
      const user_id = callbackData.split("__")[1];

      const user = await this.botService.getUserById(String(user_id));
      if (!user) {
        await ctx.reply("Siz hali ro'yxatdan o'tmagansiz");
      } else {
        await ctx.answerCbQuery("Rolni o'zgartirish tanlandi! 🎭");

        ctx.reply("🎭 Qaysi ro'lni tanlaysiz?", {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "Sahiy",
                  callback_data: `change_role_sahiy__${user_id}`,
                },
                {
                  text: "Sabrli",
                  callback_data: `change_role_sabrli__${user_id}`,
                },
              ],
            ],
          },
        });
      }
    } catch (error) {
      console.log("Error on Edit Role", error);
    }
  }

  @Action(/^change_role_sahiy__+\d+/)
  async onChangeRoleSahiy(@Ctx() ctx: Context) {
    try {
      const callbackData = ctx.callbackQuery!["data"];
      const user_id = callbackData.split("__")[1];

      const user = await this.botService.getUserById(String(user_id));
      if (!user) {
        await ctx.reply("Siz hali ro'yxatdan o'tmagansiz");
      } else {
        await this.botService.updateUserRole(String(user_id), "sahiy");

        await ctx.answerCbQuery("Rol Sahiy ga o'zgartirildi! ✅");

        ctx.reply(
          "✅ Rolingiz muvaffaqiyatli o'zgartirildi!\n\n🎭 Yangi rol: Sahiy",
          {
            reply_markup: {
              keyboard: [
                ["Ma'lumotlarni ko'rish"],
                ["Ma'lumotlarni o'zgartirish"],
                ["Yordam"],
              ],
              resize_keyboard: true,
            },
          }
        );
      }
    } catch (error) {
      console.log("Error on Change Role Sahiy", error);
    }
  }

  @Action(/^change_role_sabrli__+\d+/)
  async onChangeRoleSabrli(@Ctx() ctx: Context) {
    try {
      const callbackData = ctx.callbackQuery!["data"];
      const user_id = callbackData.split("__")[1];

      const user = await this.botService.getUserById(String(user_id));
      if (!user) {
        await ctx.reply("Siz hali ro'yxatdan o'tmagansiz");
      } else {
        await this.botService.updateUserRole(String(user_id), "sabrli");

        await ctx.answerCbQuery("Rol Sabrli ga o'zgartirildi! ✅");

        ctx.reply(
          "✅ Rolingiz muvaffaqiyatli o'zgartirildi!\n\n🎭 Yangi rol: Sabrli",
          {
            reply_markup: {
              keyboard: [
                ["Ma'lumotlarni ko'rish"],
                ["Ma'lumotlarni o'zgartirish"],
                ["Yordam"],
              ],
              resize_keyboard: true,
            },
          }
        );
      }
    } catch (error) {
      console.log("Error on Change Role Sabrli", error);
    }
  }
}
