
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async (knex) => {
    await knex.schema.table("todos", (table) => {
        table.enum('priority', ['normal', 'low', 'high']).defaultTo('normal')
    }) 
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => {
    await knex.schema.alterTable("todos", (table) => {
        table.dropColumn("priority")
    })
};
