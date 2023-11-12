/**
 * @class TextGenerator - class for generating random text
 * @property {number} - length of text to generate
 */
export class TextGenerator {
    constructor (length) {
        this.words = [];
        this.length = length;
        this.getRandomWords();
    }

    async getRandomWords() {
        try {
            const response = await fetch(`https://random-word-api.herokuapp.com/word?number=${4*this.length}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error. Status: ${response.status}`);
            }

            const data = await response.json();
            this.words = this.words.concat(data);
        } catch (error) {
            console.log('Error fetching random words: ', error);
        }
    }

    async getRenderedText() {
        /**
         * @returns {object} - object containing htmlContent and length of containing text 
         */
        try {
            if (this.words.length < this.length*3) {
                this.getRandomWords();
            }

            if (this.words.length > this.length) {
                const words = this.words.splice(0, this.length);
                const text = words.join(' ');
    
                const htmlContent = text.split('').map(letter => `<span>${letter}</span>`).join('');
                return { htmlContent, 'originalString': text };
            } else {
                await this.getRandomWords();
                return this.getRenderedText();
            }
        } catch (error) {
            console.log('Error rendering text: ', error);
        }
    }
}
