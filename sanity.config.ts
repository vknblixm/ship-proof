import { defineConfig } from 'sanity'
import { deskTool } from 'sanity/desk'
import { visionTool } from '@sanity/vision'
import { releaseCandidate } from './sanity/schemaTypes/releaseCandidate'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'your_project_id'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

export default defineConfig({
  name: 'ship-proof',
  title: 'SHIP//PROOF',
  projectId,
  dataset,
  plugins: [deskTool(), visionTool()],
  schema: {
    types: [releaseCandidate],
  },
})
