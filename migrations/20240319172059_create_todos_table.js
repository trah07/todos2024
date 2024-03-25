
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async (knex) => {
    await knex.schema.createTable('todos', (table) => {
        table.increments('id').primary()
        table.string('title').notNullable()
        table.boolean('done').notNullable().defaultTo(false)
        table.enum('priority', ['normal', 'low', 'high']).defaultTo('normal')
    })

};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => {
    await knex.schema.dropTable('todos')
  
};
