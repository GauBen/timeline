import { prisma } from "$lib/server/prisma.js";
import { error } from "@sveltejs/kit";
import * as fg from "formgator";
import { formgate, loadgate } from "formgator/sveltekit";
import type { Root } from "mdast";
import { findAndReplace } from "mdast-util-find-and-replace";
import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { visit } from "unist-util-visit";

declare module "vfile" {
  interface DataMap {
    tags?: Set<string>;
  }
}

const markdownProcessor = unified()
  .use(remarkParse)
  .use(() => (tree: Root) => {
    visit(tree, (node) => {
      if (node.type === "heading")
        node.depth = Math.min(6, node.depth + 2) as 3 | 4 | 5 | 6;
    });
  })
  .use(() => (tree: Root, file) => {
    findAndReplace(tree, [
      /#(\w{1,32})/g,
      (match: string, tag: string) => {
        file.data.tags ??= new Set();
        file.data.tags.add(tag);
        return {
          type: "link",
          url: `/journal?tag=${tag}`,
          children: [{ type: "text", value: match }],
        };
      },
    ]);
  })
  .use(remarkRehype)
  .use(rehypeSanitize)
  .use(rehypeStringify);

export const load = loadgate(
  {
    tag: fg.text({ required: true, pattern: /^\w{1,32}$/ }).optional(),
  },
  async ({ tag }, { parent }) => {
    const { me } = await parent();
    const [rawEntries, tags, count] = await Promise.all([
      prisma.journalEntry.findMany({
        where: { authorId: me.id, tags: tag ? { some: { tag } } : {} },
        orderBy: { date: "asc" },
      }),
      prisma.journalTag.groupBy({
        by: ["tag"],
        where: { authorId: me.id },
        _count: { tag: true },
        orderBy: { _count: { tag: "desc" } },
      }),
      prisma.journalEntry.count({ where: { authorId: me.id } }),
    ]);
    const entries = rawEntries.map(({ body, ...data }) => ({
      ...data,
      body,
      html: markdownProcessor.processSync(body).toString(),
    }));
    return { count, entries, tags, tag };
  },
);

export const actions = {
  default: formgate(
    {
      body: fg.textarea(),
      date: fg
        .date({
          required: true,
          // Don't allow dates in the future (for now)
          max: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
        })
        .transform((date) => date + "T00:00:00Z"),
    },
    async ({ date, body }, { locals }) => {
      if (!locals.session) error(401, "Unauthorized");

      if (body) {
        const tags = markdownProcessor.processSync(body).data.tags ?? [];

        await prisma.journalEntry.upsert({
          where: { authorId_date: { authorId: locals.session.id, date } },
          create: {
            authorId: locals.session.id,
            date,
            body,
            tags: { createMany: { data: [...tags].map((tag) => ({ tag })) } },
          },
          update: {
            body,
            tags: {
              // Remove and re-create all tags
              deleteMany: {},
              createMany: { data: [...tags].map((tag) => ({ tag })) },
            },
          },
        });
      } else {
        await prisma.journalEntry.deleteMany({
          where: { authorId: locals.session.id, date },
        });
      }
    },
  ),
};
