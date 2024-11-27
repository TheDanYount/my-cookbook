import { Entrant, PageData } from '../components/Cookbook';

type flowHandlingArguments = {
  availableHeight: number;
  endOfPage: number;
  submitHeight: number;
  lineHeight: number;
  imageHeight: number;
  isSubmitPresent: boolean;
  thisPage: PageData;
  nextPage: PageData;
  lastInput: HTMLTextAreaElement;
  lastInputRect: DOMRect;
  simElement: HTMLTextAreaElement;
  width: number;
};

export function handleOverflow({
  availableHeight,
  endOfPage,
  submitHeight,
  lineHeight,
  imageHeight,
  isSubmitPresent,
  thisPage,
  nextPage,
  lastInput,
  lastInputRect,
  simElement,
  width,
}: flowHandlingArguments) {
  const lastHoldsImage =
    thisPage.data[thisPage.data.length - 1].type === 'img-and-ingredients';
  const lastHasTitle = thisPage.data[thisPage.data.length - 1].first;
  const functionalHeight = !lastHoldsImage
    ? lastInputRect.height + (lastHasTitle ? lineHeight : 0)
    : imageHeight >= lineHeight + lastInputRect.height
    ? imageHeight
    : lineHeight + lastInputRect.height;
  if (isSubmitPresent) {
    /*
        The below type assertion is necessary because while thisPage.data cannot
        be empty at this point, typescript won't recognize that when popping
        (I tried a guard clause).
        */
    const entrantToBeMoved = thisPage.data.pop() as Entrant;
    nextPage.data.unshift(entrantToBeMoved);
    endOfPage -= submitHeight;
  }
  // The following conditional means if the entire entrant needs to be moved
  else if (
    (functionalHeight - (lastHasTitle ? lineHeight : 0) <
      endOfPage - availableHeight + lineHeight &&
      functionalHeight <= availableHeight) ||
    (lastHoldsImage &&
      lastInputRect.top + imageHeight - lineHeight > availableHeight)
  ) {
    const entrantToBeMoved = thisPage.data.pop() as Entrant;
    if (
      entrantToBeMoved.type === nextPage.data[0]?.type ||
      (entrantToBeMoved.type === 'img-and-ingredients' &&
        nextPage.data[0]?.type === 'ingredients')
    ) {
      entrantToBeMoved.text =
        String(entrantToBeMoved.text) + nextPage.data[0].text;
      nextPage.data.shift();
    }
    nextPage.data.unshift(entrantToBeMoved);
    endOfPage -= functionalHeight;
  }
  // This else means if the entrant needs to be split up
  else {
    simElement.style.width =
      lastInputRect.width / (width < 1280 ? 1 : 2) + 'px';
    if (
      thisPage.data[thisPage.data.length - 1]?.type === 'img-and-ingredients' ||
      thisPage.data[thisPage.data.length - 1]?.type === 'ingredients'
    ) {
      simElement.style.padding = '0 0 0 2px';
    } else {
      simElement.style.padding = '0 2px';
    }
    const [text, leftover] = adjustInput(
      width < 1280
        ? lastInputRect.height - (endOfPage - availableHeight)
        : (lastInputRect.height - (endOfPage - availableHeight)) / 2,
      lastInput.value,
      simElement,
      true
    );
    thisPage.data[thisPage.data.length - 1].text = text;
    const entrantToBeMoved: Entrant = lastHoldsImage
      ? { type: 'ingredients' }
      : { type: thisPage.data[thisPage.data.length - 1].type };
    entrantToBeMoved.text = leftover;
    if (entrantToBeMoved.type === nextPage.data[0]?.type) {
      nextPage.data[0].text = leftover + nextPage.data[0].text;
    } else {
      nextPage.data.unshift(entrantToBeMoved);
    }
    /*
        If a split is necessary, it will always shorten sufficiently, so the
        following line simply ends the adjusting, it's not an accurate endOfPage
        */
    endOfPage -= 10000;
  }
  if (endOfPage > availableHeight) {
    handleOverflow({
      availableHeight,
      endOfPage,
      submitHeight,
      lineHeight,
      imageHeight,
      isSubmitPresent,
      thisPage,
      nextPage,
      lastInput,
      lastInputRect,
      simElement,
      width,
    });
  }
}

export function handleUnderflow({
  availableHeight,
  endOfPage,
  submitHeight,
  lineHeight,
  imageHeight,
  isSubmitPresent,
  thisPage,
  nextPage,
  lastInput,
  lastInputRect,
  simElement,
  width,
}: flowHandlingArguments): boolean {
  if (
    thisPage.data[thisPage.data.length - 1].type === 'img-and-ingredients' &&
    lastInputRect.height + lineHeight > imageHeight
  )
    endOfPage = lastInputRect.top + lastInputRect.height;
  if (!nextPage.data[0]) return false;
  const firstHoldsImage = nextPage.data[0].type === 'img-and-ingredients';
  const firstHasTitle = nextPage.data[0].first;
  if (
    nextPage.data[0].type === 'submit' &&
    availableHeight - endOfPage >= submitHeight
  ) {
    const entrantToBeMoved = nextPage.data.shift() as Entrant;
    thisPage.data.push(entrantToBeMoved);
    endOfPage += submitHeight;
    handleUnderflow({
      availableHeight,
      endOfPage,
      submitHeight,
      lineHeight,
      imageHeight,
      isSubmitPresent,
      thisPage,
      nextPage,
      lastInput,
      lastInputRect,
      simElement,
      width,
    });
    return true;
  }
  // The following conditional is for moving img-and-ingredients
  else if (firstHoldsImage && availableHeight - endOfPage >= imageHeight) {
    simElement.style.width = '141px';
    simElement.style.padding = '0 0 0 2px';
    const simRect = simElement.getBoundingClientRect();
    simRect.width = 141;
    const [text, leftover] = adjustInput(
      width < 1280
        ? availableHeight - lastInputRect.bottom
        : (availableHeight - lastInputRect.bottom) / 2,
      nextPage.data[0].text ? nextPage.data[0].text : '',
      simElement,
      false
    );
    const entrantToBeMoved = nextPage.data.shift() as Entrant;
    entrantToBeMoved.text = text;
    if (leftover) {
      nextPage.data.unshift({ type: 'ingredients', text: leftover });
    }
    thisPage.data.push(entrantToBeMoved);
    endOfPage +=
      simRect.height > imageHeight
        ? simRect.height - (simElement.value[0] === '\n' ? lineHeight : 0)
        : imageHeight;
    handleUnderflow({
      availableHeight,
      endOfPage,
      submitHeight,
      lineHeight,
      imageHeight,
      isSubmitPresent,
      thisPage,
      nextPage,
      lastInput,
      lastInputRect,
      simElement,
      width,
    });
    return true;
  }
  // The following conditional is for all other moves
  else if (
    availableHeight - endOfPage >=
      lineHeight + (firstHasTitle ? lineHeight : 0) &&
    !(nextPage.data[0].type === 'img-and-ingredients') &&
    !(nextPage.data[0].type === 'submit')
  ) {
    const nextIsIngredients = nextPage.data[0].type === 'ingredients';
    simElement.style.width = (nextIsIngredients ? 141 : 261) + 'px';
    if (nextIsIngredients) {
      simElement.style.padding = '0 0 0 2px';
    } else {
      simElement.style.padding = '0 2px';
    }
    const [text, leftover] = adjustInput(
      width < 1280
        ? availableHeight - lastInputRect.bottom
        : (availableHeight - lastInputRect.bottom) / 2,
      nextPage.data[0].text ? nextPage.data[0].text : '',
      simElement,
      false
    );
    const entrantToBeMoved = nextPage.data.shift() as Entrant;
    entrantToBeMoved.text = text;
    if (leftover) {
      nextPage.data.unshift({
        type: entrantToBeMoved.type,
        text: leftover,
      });
    }
    if (
      entrantToBeMoved.type === thisPage.data[thisPage.data.length - 1].type ||
      (entrantToBeMoved.type === 'ingredients' &&
        thisPage.data[thisPage.data.length - 1].type === 'img-and-ingredients')
    ) {
      thisPage.data[thisPage.data.length - 1].text += entrantToBeMoved.text;
    } else {
      thisPage.data.push(entrantToBeMoved);
    }
    endOfPage +=
      simElement.getBoundingClientRect().height -
      (simElement.value[0] === '\n' ? lineHeight : 0);
    handleUnderflow({
      availableHeight,
      endOfPage,
      submitHeight,
      lineHeight,
      imageHeight,
      isSubmitPresent,
      thisPage,
      nextPage,
      lastInput,
      lastInputRect,
      simElement,
      width,
    });
    return true;
  } else {
    return false;
  }
}

function adjustInput(
  heightGoal: number,
  text: string,
  element: HTMLTextAreaElement,
  overflow: boolean
): string[] {
  if (text === '') return ['', ''];
  const recursiveTextSplitter = (
    str,
    leftover,
    lengthOfSplit,
    finalComparison
  ): string[] | undefined => {
    element.value = str;
    element.style.height = 'auto';
    element.style.height = element.scrollHeight + 'px';
    const functionalHeight =
      str[0] === '\n' && !overflow
        ? element.scrollHeight - 16
        : element.scrollHeight;
    if (functionalHeight > heightGoal) {
      if (lengthOfSplit === 1) {
        if (finalComparison) {
          return undefined;
        } else {
          return [
            str.slice(0, str.length - 1),
            str.slice(str.length - 1) + leftover,
          ];
        }
      }
      return recursiveTextSplitter(
        str.slice(0, str.length - Math.ceil(lengthOfSplit / 2)),
        str.slice(str.length - Math.ceil(lengthOfSplit / 2)) + leftover,
        Math.ceil(lengthOfSplit - lengthOfSplit / 2),
        false
      );
    } else {
      if (lengthOfSplit === 1) {
        if (finalComparison) {
          return [str, leftover];
        } else {
          return (
            recursiveTextSplitter(
              str + leftover.slice(0, 1),
              leftover.slice(1),
              1,
              true
            ) || [str, leftover]
          );
        }
      }
      return recursiveTextSplitter(
        str + leftover.slice(0, Math.ceil(lengthOfSplit / 2)),
        leftover.slice(Math.ceil(lengthOfSplit / 2)),
        Math.ceil(lengthOfSplit - lengthOfSplit / 2),
        false
      );
    }
  };
  return recursiveTextSplitter(
    text.slice(0, text.length / 2),
    text.slice(text.length / 2),
    Math.ceil(text.length / 2),
    false
  ) as string[];
}
