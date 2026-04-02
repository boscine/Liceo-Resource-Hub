import { defineConfig } from '@prisma/config';

export default defineConfig({
  datasource: {
    url: "mysql://root:12345@localhost:3306/adet_bsitdb22",
  },
});