CREATE INDEX "chat_user_id_idx" ON "chat" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "journal_user_id_idx" ON "journal" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "journal_created_at_idx" ON "journal" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "message_chat_id_idx" ON "message" USING btree ("chat_id");--> statement-breakpoint
CREATE INDEX "message_created_at_idx" ON "message" USING btree ("created_at");