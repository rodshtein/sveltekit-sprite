import { compiler, getSpriteFilesArray} from '../compiler'
import { test, expect } from 'vitest'

test('Get Sprite Files Tree', async () => {
  const filesTree = await getSpriteFilesArray('./src/test/sprite', 'sprite-');
  filesTree.forEach((file) => {
    expect(file).toMatchObject({
      path: expect.stringMatching(/src\/test\/.+?.svg/),
      id: expect.stringMatching(/sprite-.?/)
    });
  });

})

test.only('Compile', async () => {
  const filesString = await compiler({
    svgSource: './src/test/sprite',
  });
  console.log(filesString)

})