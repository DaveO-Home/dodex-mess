/**
 * knex defaults to sqlite3 - no further db config required
 * also configured and tested with postgres.
 * Set Env variable "DB=pg" to run postgres(change config as needed) 
 */
global.currentFilename = __filename;
const dbConfig = require("./db-config")(process.env.DB || "sqlite3");
const knex = require("knex")(Object.assign(
	dbConfig,
	{
		log: {
			warn(message) {
				console.warn("Sql Warn: %o", message);
			},
			error(message) {
				console.error("Sql Error: %o", message);
			},
			deprecate(message) {
				console.log("Sql Deprecate: %o", message);
			},
			debug(message) {
				console.log("Sql debug: %o", message);
			}
		}
	}));
const bookshelf = require("bookshelf")(knex);

const tables = {
	createUsers(tableName) {
		return knex.schema.createTable(tableName, (table) => {
			table.increments("id");
			table.string("name");
			table.string("password");
			table.string("ip");
			table.datetime("last_login");
			table.unique("name");
			table.unique("password");
		});
	},
	createMessages(tableName) {
		return knex.schema.createTable(tableName, (table) => {
			table.increments("id");
			table.text("message");
			table.string("from_handle"),
			table.datetime("post_date");
		});
	},
	createUndelivered(tableName) {
		return knex.schema.createTable(tableName, (table) => {
			table.integer("user_id").unsigned();
			table.integer("message_id").unsigned();
			table.foreign("user_id").references("users.id");
			table.foreign("message_id").references("messages.id");
		});
	}
};
/** Bookshelf Models
 * User - stores registered users
 */
const User = bookshelf.Model.extend({
	defaults: { "last_login": new Date() },
	tableName: "users",
	messages() {
		return this.belongsToMany(Message, "undelivered");
	}
});
/**
 * Message - stores private undelivered messages
 */
const Message = bookshelf.Model.extend({
	defaults: { "post_date": new Date() },
	tableName: "messages",
	users() {
		return this.belongsToMany(User, "undelivered");
	},
	undelivered() {
		return this.hasMany(Undelivered);
	}
});
/**
 * Undelivered - many to many relationship between User and Message
 */
const Undelivered = bookshelf.Model.extend({
	tableName: "undelivered",
	get idAttribute() { return null; }
});

exports.tables = tables;
exports.User = User;
exports.Message = Message;
exports.Undelivered = Undelivered;
exports.bookshelf = bookshelf;